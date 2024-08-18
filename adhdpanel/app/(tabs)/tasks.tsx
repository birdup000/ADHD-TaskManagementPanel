import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Animated,
  Easing,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Switch,
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AGiXTSDK from "agixt";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

interface Task {
  id: number;
  text: string;
  note?: string;
  dueDate?: string;
  priority?: string;
  repo?: string;
  subtasks: Task[];
  dependencies?: number[];
  recurrence?: string;
  completed: boolean;
  group: string;
}

const getSubtasks = async (taskText: string, taskName: string, taskData: any, apiUri: string, apiKey: string, clarificationText: string): Promise<Task[]> => {
  console.log("Getting subtasks for:", taskText, taskName, taskData, apiUri, apiKey, clarificationText);
  return [
    { id: Date.now() + 1, text: "Subtask 1 Example", completed: false, group: 'Default', subtasks: [] },
    { id: Date.now() + 2, text: "Subtask 2 Example", completed: false, group: 'Default', subtasks: [] },
  ];
};

const ProgressBar = ({ progress, color }: { progress: number, color: string }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const Sidebar = ({ groups, tasks, onGroupSelect, onClose, darkMode }: { groups: string[], tasks: Task[], onGroupSelect: (group: string) => void, onClose: () => void, darkMode: boolean }) => {
  const calculateGroupProgress = (groupName: string) => {
    const groupTasks = tasks.filter(task => task.group === groupName);
    const completedTasks = groupTasks.filter(task => task.completed);
    return groupTasks.length > 0 ? (completedTasks.length / groupTasks.length) * 100 : 0;
  };

  const totalProgress = useMemo(() => {
    return tasks.length > 0 ? (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0;
  }, [tasks]);

  return (
    <BlurView intensity={90} style={[styles.sidebar, darkMode && styles.darkModeSidebar]}>
      <TouchableOpacity style={styles.closeSidebar} onPress={onClose}>
        <MaterialIcons name="close" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
      </TouchableOpacity>
      <Text style={[styles.sidebarTitle, darkMode && styles.darkModeText]}>Progress Tracker</Text>
      <View style={styles.overallProgress}>
        <Text style={[styles.overallProgressText, darkMode && styles.darkModeText]}>Overall Progress</Text>
        <ProgressBar progress={totalProgress} color="#3498DB" />
        <Text style={[styles.progressPercentage, darkMode && styles.darkModeText]}>{totalProgress.toFixed(0)}%</Text>
      </View>
      <ScrollView style={styles.groupList}>
        {groups.map((group) => (
          <TouchableOpacity
            key={group}
            style={styles.groupItem}
            onPress={() => onGroupSelect(group)}
          >
            <Text style={[styles.groupName, darkMode && styles.darkModeText]}>{group}</Text>
            <ProgressBar progress={calculateGroupProgress(group)} color="#2ECC71" />
            <Text style={[styles.groupProgress, darkMode && styles.darkModeText]}>
              {calculateGroupProgress(group).toFixed(0)}%
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </BlurView>
  );
};

const TaskCard = ({ task, onEdit, onRemove, onAGiXTOptions, onToggleComplete, showDependencies, allTasks, darkMode }: { task: Task, onEdit: (task: Task) => void, onRemove: (id: number) => void, onAGiXTOptions: (task: Task) => void, onToggleComplete: (id: number) => void, showDependencies: boolean, allTasks: Task[], darkMode: boolean }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  const cardStyle = {
    transform: [
      {
        scale: animatedValue,
      },
    ],
    opacity: animatedValue,
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Text
            key={index}
            style={styles.link}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const getDependencyNames = (dependencyIds: number[]) => {
    return dependencyIds.map(id => {
      const dependentTask = allTasks.find(t => t.id === id);
      return dependentTask ? dependentTask.text : 'Unknown Task';
    }).join(', ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#e74c3c'; // Red
      case 'medium':
        return '#f39c12'; // Orange
      case 'low':
        return '#2ecc71'; // Green
      default:
        return '#3498db'; // Blue
    }
  };

  return (
    <Animated.View style={[styles.taskCard, cardStyle, darkMode && styles.darkModeTaskCard]}>
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <TouchableOpacity onPress={() => onToggleComplete(task.id)} style={styles.taskCheckbox}>
            <MaterialIcons 
              name={task.completed ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={task.completed ? "#4CAF50" : (darkMode ? "#FFFFFF" : "#000000")}
            />
          </TouchableOpacity>
          <Text style={[styles.taskText, task.completed && styles.completedTaskText, darkMode && styles.darkModeText]}>
            {task.text}
          </Text>
        </View>
        {task.note && (
          <Text style={[styles.noteText, darkMode && styles.darkModeText]}>
            {renderTextWithLinks(task.note)}
          </Text>
        )}
        {(task.dueDate || task.priority || task.repo || task.recurrence) && (
          <View style={styles.taskDetails}>
            {task.dueDate && (
              <View style={styles.dueDateContainer}>
                <MaterialIcons name="event" size={16} color={darkMode ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.dueDateText, darkMode && styles.darkModeText]}>
                  {new Date(task.dueDate).toLocaleString()}
                </Text>
              </View>
            )}
            {task.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityText}>{task.priority}</Text>
              </View>
            )}
            {task.repo && (
              <View style={styles.repoBadge}>
                <MaterialIcons name="code" size={16} color={darkMode ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.repoText, darkMode && styles.darkModeText]}>{task.repo}</Text>
              </View>
            )}
            {task.recurrence && (
              <View style={styles.recurrenceBadge}>
                <MaterialIcons name="repeat" size={16} color={darkMode ? "#FFFFFF" : "#000000"} />
                <Text style={[styles.recurrenceText, darkMode && styles.darkModeText]}>{task.recurrence}</Text>
              </View>
            )}
          </View>
        )}
        {showDependencies && task.dependencies && task.dependencies.length > 0 && (
          <Text style={[styles.dependenciesText, darkMode && styles.darkModeText]}>
            Dependencies: {getDependencyNames(task.dependencies)}
          </Text>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={[styles.subtasksTitle, darkMode && styles.darkModeText]}>Subtasks:</Text>
            {task.subtasks.map((subtask, index) => (
              <Text key={subtask.id} style={[styles.subtaskText, darkMode && styles.darkModeText]}>
                {index + 1}. {subtask.text}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(task)}>
          <MaterialIcons name="edit" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onAGiXTOptions(task)}>
          <MaterialIcons name="play-arrow" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onRemove(task.id)}>
          <MaterialIcons name="delete" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const FloatingActionButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <MaterialIcons name="add" size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

const CustomPicker = ({ selectedValue, onValueChange, items, darkMode }: { selectedValue: string, onValueChange: (itemValue: string) => void, items: { label: string, value: string }[], darkMode: boolean }) => {
  return (
    <View style={[styles.pickerContainer, darkMode && styles.darkModePickerContainer]}>
      <Picker
        selectedValue={selectedValue}
        style={[styles.picker, darkMode && styles.darkModePicker]}
        onValueChange={onValueChange}
        itemStyle={[styles.pickerItem, darkMode && styles.darkModePickerItem]}
      >
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};

const EnhancedDatePicker = ({ selected, onChange, darkMode }: { selected: Date | null, onChange: (date: Date | null, event?: any) => void, darkMode: boolean }) => {
  const ExampleCustomInput = React.forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(({ value, onClick }, ref) => (
    <TouchableOpacity onPress={onClick} ref={ref as React.RefObject<TouchableOpacity>} style={[styles.datePickerButton, darkMode && styles.darkModeDatePickerButton]}>
      <Text style={[styles.datePickerButtonText, darkMode && styles.darkModeText]}>
        {value ? value : "Select due date"}
      </Text>
      <MaterialIcons name="calendar-today" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
    </TouchableOpacity>
  ));

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="MMMM d, yyyy h:mm aa"
      customInput={<ExampleCustomInput />}
      popperClassName={darkMode ? "dark-mode-datepicker" : ""}
    />
  );
};

const GitHubIntegration = ({ data, isLoading, darkMode }: { data: any, isLoading: boolean, darkMode: boolean }) => {
  if (isLoading) {
    return <ActivityIndicator size="large" color={darkMode ? "#FFFFFF" : "#000000"} />;
  }

  if (!data) {
    return <Text style={[styles.errorText, darkMode && styles.darkModeText]}>No GitHub data available</Text>;
  }

  return (
    <View style={[styles.githubIntegration, darkMode && styles.darkModeGithubIntegration]}>
      <Text style={[styles.githubUsername, darkMode && styles.darkModeText]}>
        GitHub User: {data.login}
      </Text>
      <Text style={[styles.githubBio, darkMode && styles.darkModeText]}>
        Bio: {data.bio || 'No bio available'}
      </Text>
      <Text style={[styles.githubStats, darkMode && styles.darkModeText]}>
        Public Repos: {data.public_repos} | Followers: {data.followers} | Following: {data.following}
      </Text>
      {data.repositories && (
        <>
          <Text style={[styles.repoTitle, darkMode && styles.darkModeText]}>Recent Repositories:</Text>
          {data.repositories.slice(0, 5).map((repo: any) => (
            <Text key={repo.id} style={[styles.repoItem, darkMode && styles.darkModeText]}>
              {repo.name} - {repo.description || 'No description'}
            </Text>
          ))}
        </>
      )}
    </View>
  );
};

const ChatSidebar = ({ visible, onClose, uri, darkMode }: { visible: boolean, onClose: () => void, uri: string, darkMode: boolean }) => {
  if (!visible) return null;

  const validUri = uri && typeof uri === 'string' && uri.trim() !== '' ? uri : null;

  const renderContent = () => {
    if (!validUri) {
      return (
        <View style={styles.unsupportedPlatform}>
          <Text style={[styles.unsupportedText, darkMode && styles.darkModeText]}>
            No valid URL provided for the chat.
          </Text>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <iframe
          src={validUri}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      );
    } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return (
        <WebView
          source={{ uri: validUri }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={darkMode ? "#FFFFFF" : "#000000"} />
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      );
    } else {
      return (
        <View style={styles.unsupportedPlatform}>
          <Text style={[styles.unsupportedText, darkMode && styles.darkModeText]}>
            Chat is not supported on this platform.
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={[styles.chatSidebar, darkMode && styles.darkModeChatSidebar]}>
      <TouchableOpacity style={styles.closeChatButton} onPress={onClose}>
        <MaterialIcons name="close" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
      </TouchableOpacity>
      {renderContent()}
    </View>
  );
};

const EditTaskModal = ({ visible, task, onClose, onSave, repositories, allTasks, darkMode }: { visible: boolean, task: Task | null, onClose: () => void, onSave: (task: Task) => void, repositories: any[], allTasks: Task[], darkMode: boolean }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : []
      });
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    } else {
      setEditedTask({
        id: Date.now(),
        text: '',
        note: '',
        priority: 'low',
        repo: '',
        subtasks: [],
        dependencies: [],
        recurrence: '',
        completed: false,
        group: 'Default',
      });
      setDueDate(null);
    }
  }, [task]);

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
    }
    onClose();
  };

  const toggleDependency = (taskId: number) => {
    if (editedTask) {
      const currentDependencies = editedTask.dependencies || [];
      const updatedDependencies = currentDependencies.includes(taskId)
        ? currentDependencies.filter(id => id !== taskId)
        : [...currentDependencies, taskId];
      handleChange('dependencies', updatedDependencies);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, darkMode && styles.darkModeOverlay]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingModal}
        >
          <View style={[styles.modalContent, darkMode && styles.darkModeModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkModeText]}>
                {task ? "Edit Task" : "Add New Task"}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color={darkMode ? "#FFFFFF" : "#000000"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Task Name</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.darkModeInput]}
                  value={editedTask?.text || ''}
                  onChangeText={(text) => handleChange('text', text)}
                  placeholder="Enter task name"
                  placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
                />
                
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput, darkMode && styles.darkModeInput]}
                  value={editedTask?.note || ''}
                  onChangeText={(text) => handleChange('note', text)}
                  placeholder="Enter task description"
                  placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
                  multiline
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Due Date</Text>
                <EnhancedDatePicker
                  selected={dueDate}
                  onChange={(date) => {
                    setDueDate(date);
                    handleChange('dueDate', date?.toISOString());
                  }}
                  darkMode={darkMode}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Priority</Text>
                <CustomPicker
                  selectedValue={editedTask?.priority || 'low'}
                  onValueChange={(value) => handleChange('priority', value)}
                  items={[
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ]}
                  darkMode={darkMode}
                />
                
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Repository</Text>
                <CustomPicker
                  selectedValue={editedTask?.repo || ''}
                  onValueChange={(value) => handleChange('repo', value)}
                  items={[
                    { label: "None", value: "" },
                    ...repositories.map(repo => ({ label: repo.name, value: repo.name }))
                  ]}
                  darkMode={darkMode}
                />

                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Recurrence</Text>
                <CustomPicker
                  selectedValue={editedTask?.recurrence || ''}
                  onValueChange={(value) => handleChange('recurrence', value)}
                  items={[
                    { label: "None", value: '' },
                    { label: "Daily", value: "daily" },
                    { label: "Weekly", value: "weekly" },
                    { label: "Monthly", value: "monthly" },
                    { label: "Yearly", value: "yearly" },
                  ]}
                  darkMode={darkMode}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Group</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.darkModeInput]}
                  value={editedTask?.group || ''}
                  onChangeText={(text) => handleChange('group', text)}
                  placeholder="Enter group name"
                  placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Subtasks</Text>
                {editedTask?.subtasks.map((subtask, index) => (
                  <View key={subtask.id} style={styles.subtaskItem}>
                    <TextInput
                      style={[styles.input, styles.subtaskInput, darkMode && styles.darkModeInput]}
                      value={subtask.text}
                      onChangeText={(text) => {
                        const updatedSubtasks = [...(editedTask?.subtasks || [])];
                        updatedSubtasks[index].text = text;
                        handleChange('subtasks', updatedSubtasks);
                      }}
                      placeholder={`Subtask ${index + 1}`}
                      placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
                    />
                    <TouchableOpacity onPress={() => {
                      const updatedSubtasks = editedTask?.subtasks.filter((_, i) => i !== index) || [];
                      handleChange('subtasks', updatedSubtasks);
                    }}>
                      <MaterialIcons name="remove-circle-outline" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addSubtaskButton} onPress={() => {
                  const newSubtask = { id: Date.now(), text: '', completed: false, group: 'Default', subtasks: [] };
                  if (editedTask) {
                    handleChange('subtasks', [...(editedTask.subtasks || []), newSubtask]);
                  }
                }}>
                  <MaterialIcons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={[styles.addSubtaskText, darkMode && styles.darkModeText]}>Add Subtask</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Dependencies</Text>
                {allTasks
                  .filter(t => t.id !== editedTask?.id)
                  .map(task => (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.dependencyItem,
                        editedTask?.dependencies?.includes(task.id) && styles.dependencyItemSelected,
                        darkMode && styles.darkModeDependencyItem
                      ]}
                      onPress={() => toggleDependency(task.id)}
                    >
                      <Text style={[styles.dependencyItemText, darkMode && styles.darkModeText]}>{task.text}</Text>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const AGiXTModal = ({ visible, onClose, onAgentSelect, chains, agents, selectedAgent, setSelectedAgent, darkMode }: { visible: boolean, onClose: () => void, onAgentSelect: (agent: string, chain: string, input: string) => void, chains: string[], agents: { name: string }[], selectedAgent: string, setSelectedAgent: (agent: string) => void, darkMode: boolean }) => {
  const [selectedChain, setSelectedChain] = useState("");
  const [chainInput, setChainInput] = useState("");

  const handleOk = () => {
    onAgentSelect(selectedAgent, selectedChain, chainInput);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, darkMode && styles.darkModeOverlay]}>
        <View style={[styles.modalContent, darkMode && styles.darkModeModalContent]}>
          <Text style={[styles.modalTitle, darkMode && styles.darkModeText]}>Select an Agent and Chain</Text>
          {agents.length > 0 ? (
            <CustomPicker
              selectedValue={selectedAgent}
              onValueChange={setSelectedAgent}
              items={agents.map(agent => ({ label: agent.name, value: agent.name }))}
              darkMode={darkMode}
            />
          ) : (
            <Text style={[styles.noAgentsText, darkMode && styles.darkModeText]}>No agents available</Text>
          )}
          <CustomPicker
            selectedValue={selectedChain}
            onValueChange={setSelectedChain}
            items={[{ label: "Select a chain", value: "" }, ...chains.map(chain => ({ label: chain, value: chain }))]}
            darkMode={darkMode}
          />
          <TextInput
            style={[styles.chainInput, darkMode && styles.darkModeInput]}
            value={chainInput}
            onChangeText={setChainInput}
            placeholder="Enter chain input"
            placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleOk} disabled={!selectedAgent || !selectedChain}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AGiXTOptionsModal = ({ visible, onClose, onOptionSelect, darkMode }: { visible: boolean, onClose: () => void, onOptionSelect: (option: string) => void, darkMode: boolean }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, darkMode && styles.darkModeOverlay]}>
        <View style={[styles.modalContent, darkMode && styles.darkModeModalContent]}>
          <Text style={[styles.modalTitle, darkMode && styles.darkModeText]}>AGiXT Options</Text>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => onOptionSelect('getSubtasks')}
          >
            <Text style={[styles.modalOptionText, darkMode && styles.darkModeText]}>Get Subtasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => onOptionSelect('runChain')}
          >
            <Text style={[styles.modalOptionText, darkMode && styles.darkModeText]}>Run Chain</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SubtaskClarificationModal = ({ visible, onClose, onContinue, clarificationText, onChangeClarificationText, isLoading, darkMode }: { visible: boolean, onClose: () => void, onContinue: () => void, clarificationText: string, onChangeClarificationText: (text: string) => void, isLoading: boolean, darkMode: boolean }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, darkMode && styles.darkModeOverlay]}>
        <View style={[styles.modalContent, darkMode && styles.darkModeModalContent]}>
          <Text style={[styles.modalTitle, darkMode && styles.darkModeText]}>Get Subtasks Clarification</Text>
          <TextInput
            style={[styles.clarificationInput, darkMode && styles.darkModeInput]}
            value={clarificationText}
            onChangeText={onChangeClarificationText}
            placeholder="Enter optional clarification text"
            placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
            multiline
            editable={!isLoading}
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onContinue} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AlertModal = ({ visible, title, message, onClose, darkMode }: { visible: boolean, title: string, message: string, onClose: () => void, darkMode: boolean }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={[styles.alertOverlay, darkMode && styles.darkModeOverlay]}>
        <View style={[styles.alertContent, darkMode && styles.darkModeModalContent]}>
          <Text style={[styles.alertTitle, darkMode && styles.darkModeText]}>{title}</Text>
          <Text style={[styles.alertMessage, darkMode && styles.darkModeText]}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const LoadingOverlay = ({ darkMode }: { darkMode: boolean }) => (
  <View style={[styles.loadingOverlay, darkMode && styles.darkModeOverlay]}>
    <ActivityIndicator size="large" color={darkMode ? "#FFFFFF" : "#000000"} />
  </View>
);

const TaskPanel = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [showAGiXTModal, setShowAGiXTModal] = useState(false);
  const [chains, setChains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agixtApiUri, setAgixtApiUri] = useState("");
  const [agixtApiKey, setAgixtApiKey] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("low");
  const [showAGiXTOptionsModal, setShowAGiXTOptionsModal] = useState(false);
  const [selectedTaskForAGiXT, setSelectedTaskForAGiXT] = useState<Task | null>(null);
  const [showSubtaskClarificationModal, setShowSubtaskClarificationModal] = useState(false);
  const [subtaskClarificationText, setSubtaskClarificationText] = useState("");
  const [repositories, setRepositories] = useState<any[]>([]);
  const [agents, setAgents] = useState<{ name: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showGithubIntegration, setShowGithubIntegration] = useState(false);
  const [showDependentTasks, setShowDependentTasks] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [sortBy, setSortBy] = useState("dueDate");
  const [taskGroups, setTaskGroups] = useState<{ [key: string]: Task[] }>({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [interactiveUri, setInteractiveUri] = useState("");

  const showAlert = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadGithubData(),
          loadAgixtData(),
          loadTasks(),
          getChains(),
          getAgents(),
          fetchRepositories(),
          loadInteractiveUri(),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        showAlert("Error", "Failed to load initial data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    const interval = setInterval(handleRecurringTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    groupTasks();
  }, [tasks, groupBy, showCompletedTasks, sortBy]);

  useEffect(() => {
    console.log("interactiveUri changed:", interactiveUri);
  }, [interactiveUri]);

  const loadGithubData = async () => {
    try {
      const storedGithubUsername = await AsyncStorage.getItem('githubUsername');
      if (storedGithubUsername) {
        setGithubUsername(storedGithubUsername);
      }
    } catch (error) {
      console.error('Error getting GitHub username from AsyncStorage:', error);
      throw error;
    }
  };

  const loadAgixtData = async () => {
    try {
      const storedAgixtApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
      const storedAgixtApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);
      if (storedAgixtApiUri && storedAgixtApiKey) {
        setAgixtApiUri(storedAgixtApiUri);
        setAgixtApiKey(storedAgixtApiKey);
      }
    } catch (error) {
      console.error('Error getting AGiXT data from AsyncStorage:', error);
      throw error;
    }
  };

  const loadInteractiveUri = async () => {
    try {
      const uri = await AsyncStorage.getItem('interactive_uri');
      if (uri) {
        setInteractiveUri(uri);
      }
    } catch (error) {
      console.error('Error loading interactive URI:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      throw error;
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error saving tasks:", error);
      throw error;
    }
  };

  const getChains = async () => {
    try {
      const ApiClient = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      const chainsObject = await ApiClient.getChains();
      
      let chainsArray: string[];
      if (Array.isArray(chainsObject)) {
        chainsArray = chainsObject;
      } else if (typeof chainsObject === 'object') {
        chainsArray = Object.keys(chainsObject);
      } else {
        throw new Error('Unexpected response format for chains');
      }
      
      setChains(chainsArray);
    } catch (error) {
      console.error("Error getting chains:", error);
      throw error;
    }
  };

  const getAgents = async () => {
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      const agentList = await agixt.getAgents();
      
      let formattedAgents: { name: string }[] = [];
      if (Array.isArray(agentList)) {
        formattedAgents = agentList;
      } else if (typeof agentList === 'object') {
        formattedAgents = Object.keys(agentList).map(name => ({ name }));
      }
      
      setAgents(formattedAgents);
      if (formattedAgents.length > 0) {
        setSelectedAgent(formattedAgents[0].name);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
      throw error;
    }
  };

  const fetchRepositories = async () => {
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      
      const conversationName = "GitHub Repositories";
      
      await agixt.newConversation(selectedAgent, conversationName);
      
      const result = await agixt.executeCommand(
        selectedAgent,
        "Get List of My Github Repositories",
        {}, 
        conversationName
      );

      if (typeof result === 'string') {
        const parsedRepos = JSON.parse(result);
        setRepositories(parsedRepos);
      } else if (Array.isArray(result)) {
        setRepositories(result);
      } else {
        throw new Error("Unexpected repository data format");
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  };

  const fetchGithubData = async () => {
    if (!githubUsername) {
      showAlert("GitHub Username Missing", "Please set your GitHub username in the settings.");
      return;
    }

    setIsLoadingGithub(true);
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      
      const conversationName = "GitHub User Data";
      
      await agixt.newConversation(selectedAgent, conversationName);
      
      const result = await agixt.executeCommand(
        selectedAgent,
        "Get GitHub User Data",
        { username: githubUsername },
        conversationName
      );

      if (typeof result === 'string') {
        const parsedData = JSON.parse(result);
        setGithubData(parsedData);
      } else if (typeof result === 'object') {
        setGithubData(result);
      } else {
        throw new Error("Unexpected GitHub data format");
      }
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      showAlert("Error", "Failed to fetch GitHub data. Please try again.");
    } finally {
      setIsLoadingGithub(false);
    }
  };

  const addTask = useCallback(() => {
    if (newTaskText.trim().length > 0) {
      const newTask: Task = {
        id: Date.now(),
        text: newTaskText.trim(),
        note: "",
        dueDate: undefined,
        priority: newTaskPriority,
        repo: "",
        subtasks: [],
        dependencies: [],
        recurrence: '',
        completed: false,
        group: "Default",
      };
      saveTasks([...tasks, newTask]);
      setNewTaskText("");
    }
  }, [newTaskText, newTaskPriority, tasks, saveTasks]);

  const removeTask = useCallback((id: number) => {
    const taskToRemove = tasks.find(task => task.id === id);
    if (taskToRemove) {
      const dependentTasks = tasks.filter(task => task.dependencies && task.dependencies.includes(id));
  
      if (dependentTasks.length > 0) {
        showAlert("Cannot Delete Task", `This task cannot be deleted because it is a dependency for: ${dependentTasks.map(t => t.text).join(', ')}. Complete these tasks first.`);
        return;
      }
  
      if (taskToRemove.dependencies && taskToRemove.dependencies.length > 0) {
        const incompleteDependencies = taskToRemove.dependencies.filter(depId => 
          tasks.find(t => t.id === depId && !t.completed)
        );

        if (incompleteDependencies.length > 0) {
          const incompleteTaskNames = incompleteDependencies.map(depId => 
            tasks.find(t => t.id === depId)?.text || 'Unknown Task'
          ).join(', ');

          showAlert("Cannot Delete Task", `Complete the following dependent tasks first: ${incompleteTaskNames}`);
          return;
        }
      }
    }

    saveTasks(tasks.filter((task) => task.id !== id));
  }, [tasks, saveTasks, showAlert]);

  const editTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  }, []);

  const handleSaveTask = useCallback((editedTask: Task) => {
    const updatedTasks = tasks.map((task) =>
      task.id === editedTask.id ? editedTask : task
    );
    saveTasks(updatedTasks);
    setShowEditModal(false);
    setSelectedTask(null);
  }, [tasks, saveTasks]);

  const handleAgentSelect = useCallback(async (agent: string, chain: string, input: string) => {
    setShowAGiXTModal(false);
    if (chain) {
      await executeChain(agent, chain, input);
    }
  }, []);

  const executeChain = async (agent: string, chain: string, input: string) => {
    try {
      setIsLoading(true);
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      const result = await agixt.runChain(chain, input, agent);
      console.log("Chain execution result:", result);
    } catch (error) {
      console.error("Error executing chain:", error);
      showAlert("Error", "Failed to execute chain. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAGiXTOptionSelect = useCallback(async (option: string) => {
    if (option === 'getSubtasks') {
      setShowSubtaskClarificationModal(true);
    } else if (option === 'runChain') {
      setShowAGiXTModal(true);
    }
    setShowAGiXTOptionsModal(false);
  }, []);

  const handleGetSubtasks = useCallback(async () => {
    if (selectedTaskForAGiXT) {
      setShowSubtaskClarificationModal(false);
      setIsLoading(true);
      try {
        const subtasks = await getSubtasks(
          selectedTaskForAGiXT.text,
          selectedTaskForAGiXT.text,
          {
            note: selectedTaskForAGiXT.note,
            dueDate: selectedTaskForAGiXT.dueDate,
            priority: selectedTaskForAGiXT.priority,
          },
          agixtApiUri,
          agixtApiKey,
          subtaskClarificationText
        );
        const updatedTasks = tasks.map(task => 
          task.id === selectedTaskForAGiXT.id 
            ? { ...task, subtasks: [...(task.subtasks || []), ...subtasks] }
            : task
        );
        saveTasks(updatedTasks);
        setSubtaskClarificationText("");
      } catch (error) {
        console.error("Error getting subtasks:", error);
        showAlert("Error", "Failed to get subtasks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedTaskForAGiXT, subtaskClarificationText, tasks, saveTasks, agixtApiUri, agixtApiKey, showAlert]);

  const handleRecurringTasks = useCallback(() => {
    const now = new Date();
    const updatedTasks = tasks.map(task => {
      if (task.recurrence && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (now > dueDate) {
          let newDueDate: Date | undefined;
          switch (task.recurrence) {
            case 'daily':
              newDueDate = new Date(dueDate.setDate(dueDate.getDate() + 1));
              break;
            case 'weekly':
              newDueDate = new Date(dueDate.setDate(dueDate.getDate() + 7));
              break;
            case 'monthly':
              newDueDate = new Date(dueDate.setMonth(dueDate.getMonth() + 1));
              break;
            case 'yearly':
              newDueDate = new Date(dueDate.setFullYear(dueDate.getFullYear() + 1));
              break;
          }
          if (newDueDate) {
            return { ...task, dueDate: newDueDate.toISOString(), completed: false };
          }
        }
      }
      return task;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      saveTasks(updatedTasks);
    }
  }, [tasks, saveTasks]);

  const onToggleComplete = useCallback((id: number) => {
    const taskToToggle = tasks.find(task => task.id === id);
    
    if (taskToToggle && taskToToggle.dependencies && !taskToToggle.completed) {
      const incompleteDependencies = taskToToggle.dependencies.filter(depId => 
        tasks.find(t => t.id === depId && !t.completed)
      );

      if (incompleteDependencies.length > 0) {
        const incompleteTaskNames = incompleteDependencies.map(depId => 
          tasks.find(t => t.id === depId)?.text || 'Unknown Task'
        ).join(', ');

        showAlert("Cannot Complete Task", `Complete the following dependent tasks first: ${incompleteTaskNames}`);
        return;
      }
    }

    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  }, [tasks, saveTasks, showAlert]);

  const groupTasks = useCallback(() => {
    let filteredTasks = showCompletedTasks ? tasks : tasks.filter(task => !task.completed);

    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return (new Date(a.dueDate || '9999-12-31')).getTime() - (new Date(b.dueDate || '9999-12-31')).getTime();
        case 'priority':
          const priorityOrder: { [key: string]: number } = { high: 0, medium: 1, low: 2, undefined: 3 };
          return (priorityOrder[a.priority || 'undefined'] || 3) - (priorityOrder[b.priority || 'undefined'] || 3);
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    const groups: { [key: string]: Task[] } = {};
    filteredTasks.forEach(task => {
      let groupKey: string;
      switch (groupBy) {
        case 'priority':
          groupKey = task.priority || 'No Priority';
          break;
        case 'dueDate':
          groupKey = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';
          break;
        case 'group':
          groupKey = task.group || 'Default';
          break;
        default:
          groupKey = 'All Tasks';
      }
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    setTaskGroups(groups);
  }, [tasks, groupBy, showCompletedTasks, sortBy]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group);
    setShowSidebar(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleGithubIntegration = () => {
    if (!showGithubIntegration && !githubData) {
      fetchGithubData();
    }
    setShowGithubIntegration(!showGithubIntegration);
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.darkMode]}>
      <LinearGradient
        colors={darkMode ? ['#2c3e50', '#34495e'] : ['#4CA1AF', '#C4E0E5']}
        style={styles.container}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={28} color={darkMode ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text style={[styles.title, darkMode && styles.darkModeText]}>Task Manager</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowChatSidebar(true)}>
              <MaterialIcons name="chat" size={28} color={darkMode ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <Switch 
              value={darkMode} 
              onValueChange={toggleDarkMode} 
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={darkMode ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.integrationBar}>
          <TouchableOpacity
            style={[styles.integrationButton, showGithubIntegration && styles.integrationButtonActive, darkMode && styles.darkModeIntegrationButton]}
            onPress={toggleGithubIntegration}
          >
            <MaterialIcons name="code" size={24} color={showGithubIntegration ? "#FFFFFF" : (darkMode ? "#FFFFFF80" : "#BBBBBB")} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.integrationButton, showDependentTasks && styles.integrationButtonActive, darkMode && styles.darkModeIntegrationButton]}
            onPress={() => setShowDependentTasks(!showDependentTasks)}
          >
            <MaterialIcons name="account-tree" size={24} color={showDependentTasks ? "#FFFFFF" : (darkMode ? "#FFFFFF80" : "#BBBBBB")} />
          </TouchableOpacity>
        </View>

        {selectedGroup && (
          <Text style={[styles.selectedGroupTitle, darkMode && styles.darkModeText]}>{selectedGroup}</Text>
        )}

        <View style={styles.filterContainer}>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, darkMode && styles.darkModeText]}>Group By:</Text>
            <CustomPicker
              selectedValue={groupBy}
              onValueChange={(itemValue) => setGroupBy(itemValue)}
              items={[
                { label: "None", value: "none" },
                { label: "Priority", value: "priority" },
                { label: "Due Date", value: "dueDate" },
                { label: "Custom Group", value: "group" },
              ]}
              darkMode={darkMode}
            />
          </View>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, darkMode && styles.darkModeText]}>Sort By:</Text>
            <CustomPicker
              selectedValue={sortBy}
              onValueChange={(itemValue) => setSortBy(itemValue)}
              items={[
                { label: "Due Date", value: "dueDate" },
                { label: "Priority", value: "priority" },
                { label: "Alphabetical", value: "alphabetical" },
              ]}
              darkMode={darkMode}
            />
          </View>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, darkMode && styles.darkModeText]}>Show Completed:</Text>
            <Switch 
              value={showCompletedTasks} 
              onValueChange={setShowCompletedTasks} 
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={showCompletedTasks ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, darkMode && styles.darkModeInput]}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Enter a task"
              placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
            />
            <TouchableOpacity style={[styles.addButton, darkMode && styles.darkModeAddButton]} onPress={addTask}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {showGithubIntegration && (
            <GitHubIntegration 
              data={githubData} 
              isLoading={isLoadingGithub}
              darkMode={darkMode}
            />
          )}

          <FlatList
            data={Object.entries(taskGroups)}
            keyExtractor={(item) => item[0]}
            renderItem={({ item: [groupName, groupTasks] }) => (
              <View style={styles.taskGroup}>
                <Text style={[styles.groupTitle, darkMode && styles.darkModeText]}>{groupName}</Text>
                {groupTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => editTask(task)}
                    onRemove={() => removeTask(task.id)}
                    onAGiXTOptions={(task) => {
                      setSelectedTaskForAGiXT(task);
                      setShowAGiXTOptionsModal(true);
                    }}
                    onToggleComplete={onToggleComplete}
                    showDependencies={showDependentTasks}
                    allTasks={tasks}
                    darkMode={darkMode}
                  />
                ))}
              </View>
            )}
          />
        </KeyboardAvoidingView>

        <FloatingActionButton onPress={() => setShowEditModal(true)} />

        {showSidebar && (
          <Sidebar
            groups={Object.keys(taskGroups)}
            tasks={tasks}
            onGroupSelect={handleGroupSelect}
            onClose={toggleSidebar}
            darkMode={darkMode}
          />
        )}

        <EditTaskModal
          visible={showEditModal}
          task={selectedTask}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveTask}
          repositories={repositories}
          allTasks={tasks}
          darkMode={darkMode}
        />

<AGiXTModal
          visible={showAGiXTModal}
          onClose={() => setShowAGiXTModal(false)}
          onAgentSelect={handleAgentSelect}
          chains={chains}
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          darkMode={darkMode}
        />

        <AGiXTOptionsModal
          visible={showAGiXTOptionsModal}
          onClose={() => setShowAGiXTOptionsModal(false)}
          onOptionSelect={handleAGiXTOptionSelect}
          darkMode={darkMode}
        />

        <SubtaskClarificationModal
          visible={showSubtaskClarificationModal}
          onClose={() => setShowSubtaskClarificationModal(false)}
          onContinue={handleGetSubtasks}
          clarificationText={subtaskClarificationText}
          onChangeClarificationText={setSubtaskClarificationText}
          isLoading={isLoading}
          darkMode={darkMode}
        />

        <AlertModal
          visible={showAlertModal}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlertModal(false)}
          darkMode={darkMode}
        />

        <ChatSidebar
          visible={showChatSidebar}
          onClose={() => setShowChatSidebar(false)}
          uri={interactiveUri || ""}
          darkMode={darkMode}
        />

        {isLoading && <LoadingOverlay darkMode={darkMode} />}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkMode: {
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkModeText: {
    color: '#FFFFFF',
  },
  selectedGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    marginBottom: 5,
    color: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  darkModeInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    borderColor: '#555',
  },
  addButton: {
    backgroundColor: '#3498DB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkModeAddButton: {
    backgroundColor: '#2980b9',
  },
  taskGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkModeOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModeModalContent: {
    backgroundColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  saveButton: {
    backgroundColor: '#2ECC71',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3498DB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  darkModePickerContainer: {
    borderColor: '#555',
  },
  picker: {
    height: 40,
    color: '#000000',
  },
  darkModePicker: {
    color: '#FFFFFF',
  },
  pickerItem: {
    color: '#000000',
  },
  darkModePickerItem: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  darkModeDatePickerButton: {
    backgroundColor: '#333333',
    borderColor: '#555',
  },
  datePickerButtonText: {
    color: '#000000',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModeTaskCard: {
    backgroundColor: '#333333',
    borderColor: '#555',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  noteText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 5,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dueDateText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  repoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  repoText: {
    color: '#000000',
    fontSize: 12,
    marginLeft: 5,
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurrenceText: {
    color: '#000000',
    fontSize: 12,
    marginLeft: 5,
  },
  dependenciesText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 5,
  },
  subtasksContainer: {
    marginTop: 10,
  },
  subtasksTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtaskText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 10,
  },
  taskActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  actionButton: {
    padding: 5,
  },
  link: {
    color: '#3498DB',
    textDecorationLine: 'underline',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModeSidebar: {
    backgroundColor: 'rgba(52, 52, 52, 0.95)',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  overallProgress: {
    marginBottom: 20,
  },
  overallProgressText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000000',
  },
  progressPercentage: {
    fontSize: 16,
    textAlign: 'right',
    color: '#000000',
  },
  groupList: {
    flex: 1,
  },
  groupItem: {
    marginBottom: 15,
  },
  groupName: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000000',
  },
  groupProgress: {
    fontSize: 14,
    textAlign: 'right',
    color: '#000000',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  closeSidebar: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  githubIntegration: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  darkModeGithubIntegration: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: '#555',
  },
  githubUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  githubBio: {
    fontSize: 14,
    marginBottom: 10,
    color: '#000000',
  },
  githubStats: {
    fontSize: 14,
    marginBottom: 10,
    color: '#000000',
  },
  repoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#000000',
  },
  repoItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#000000',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
  chatSidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.75,
    height: height,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModeChatSidebar: {
    backgroundColor: '#333333',
  },
  closeChatButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1001,
  },
  webView: {
    flex: 1,
  },
  integrationBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  integrationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  darkModeIntegrationButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: '#555',
  },
  integrationButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#2980b9',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  alertTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertMessage: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unsupportedPlatform: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000000',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtaskInput: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addSubtaskText: {
    marginLeft: 5,
    color: '#3498DB',
  },
  dependencyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  darkModeDependencyItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: '#555',
  },
  dependencyItemSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#2980b9',
  },
  dependencyItemText: {
    color: '#000000',
  },
  chainInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E74C3C',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clarificationInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  keyboardAvoidingModal: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  noAgentsText: {
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default TaskPanel;
