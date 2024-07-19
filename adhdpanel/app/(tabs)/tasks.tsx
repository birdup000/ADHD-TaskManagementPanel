import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AGiXTSDK from "agixt";
import { LinearGradient } from 'expo-linear-gradient';

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

export default function TaskPanel() {
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [showAGiXTModal, setShowAGiXTModal] = useState(false);
  const [chains, setChains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agixtApiUri, setAgixtApiUri] = useState("");
  const [agixtApiKey, setAgixtApiKey] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("");
  const [showAGiXTOptionsModal, setShowAGiXTOptionsModal] = useState(false);
  const [selectedTaskForAGiXT, setSelectedTaskForAGiXT] = useState(null);
  const [showSubtaskClarificationModal, setShowSubtaskClarificationModal] = useState(false);
  const [subtaskClarificationText, setSubtaskClarificationText] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showGithubIntegration, setShowGithubIntegration] = useState(false);
  const [showDependentTasks, setShowDependentTasks] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

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

  const saveTasks = async (updatedTasks) => {
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
      
      let chainsArray;
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
      
      let formattedAgents = [];
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

  const addTask = useCallback(() => {
    if (newTaskText.trim().length > 0) {
      const newTask = {
        id: Date.now(),
        text: newTaskText.trim(),
        note: "",
        dueDate: null,
        priority: newTaskPriority,
        repo: "",
        subtasks: [],
        dependencies: [],
        recurrence: null,
        completed: false,
      };
      saveTasks([...tasks, newTask]);
      setNewTaskText("");
      setNewTaskPriority("");
    }
  }, [newTaskText, newTaskPriority, tasks, saveTasks]);

  const removeTask = useCallback((id) => {
    const taskToRemove = tasks.find(task => task.id === id);
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
          tasks.find(t => t.id === depId).text
        ).join(', ');

        showAlert("Cannot Delete Task", `Complete the following dependent tasks first: ${incompleteTaskNames}`);
        return;
      }
    }

    saveTasks(tasks.filter((task) => task.id !== id));
  }, [tasks, saveTasks, showAlert]);

  const editTask = useCallback((task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  }, []);

  const handleSaveTask = useCallback((editedTask) => {
    const updatedTasks = tasks.map((task) =>
      task.id === editedTask.id ? editedTask : task
    );
    saveTasks(updatedTasks);
    setShowEditModal(false);
    setSelectedTask(null);
  }, [tasks, saveTasks]);

  const handleAgentSelect = useCallback(async (agent, chain, input) => {
    setShowAGiXTModal(false);
    if (chain) {
      await executeChain(agent, chain, input);
    }
  }, []);

  const executeChain = async (agent, chain, input) => {
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

  const handleAGiXTOptionSelect = useCallback(async (option) => {
    if (option === 'getSubtasks') {
      setShowSubtaskClarificationModal(true);
    } else if (option === 'runChain') {
      setShowAGiXTModal(true);
    }
    setShowAGiXTOptionsModal(false);
  }, []);

  const handleGetSubtasks = useCallback(async () => {
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
  }, [selectedTaskForAGiXT, subtaskClarificationText, tasks, saveTasks, agixtApiUri, agixtApiKey, showAlert]);

  const handleRecurringTasks = useCallback(() => {
    const now = new Date();
    const updatedTasks = tasks.map(task => {
      if (task.recurrence && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (now > dueDate) {
          let newDueDate;
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
          return { ...task, dueDate: newDueDate.toISOString() };
        }
      }
      return task;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      saveTasks(updatedTasks);
    }
  }, [tasks, saveTasks]);

  const onToggleComplete = useCallback((id) => {
    const taskToToggle = tasks.find(task => task.id === id);
    
    if (!taskToToggle.completed) {
      const incompleteDependencies = taskToToggle.dependencies.filter(depId => 
        tasks.find(t => t.id === depId && !t.completed)
      );

      if (incompleteDependencies.length > 0) {
        const incompleteTaskNames = incompleteDependencies.map(depId => 
          tasks.find(t => t.id === depId).text
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

  const showAlert = useCallback((title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  }, []);

  const renderTaskItem = useCallback(({ item }) => (
    <TaskItem
      task={item}
      onEdit={() => editTask(item)}
      onRemove={() => removeTask(item.id)}
      onAGiXTOptions={(task) => {
        setSelectedTaskForAGiXT(task);
        setShowAGiXTOptionsModal(true);
      }}
      onToggleComplete={onToggleComplete}
      showDependencies={showDependentTasks}
      allTasks={tasks}
    />
  ), [editTask, removeTask, onToggleComplete, showDependentTasks, tasks, setSelectedTaskForAGiXT]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#2C3E50', '#34495E', '#4A5568']}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Task Manager</Text>
          <View style={styles.integrationBar}>
            <TouchableOpacity
              style={[styles.integrationButton, showGithubIntegration && styles.integrationButtonActive]}
              onPress={() => setShowGithubIntegration(!showGithubIntegration)}
            >
              <MaterialIcons name="code" size={24} color={showGithubIntegration ? "#FFFFFF" : "#BBBBBB"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.integrationButton, showDependentTasks && styles.integrationButtonActive]}
              onPress={() => setShowDependentTasks(!showDependentTasks)}
            >
              <MaterialIcons name="account-tree" size={24} color={showDependentTasks ? "#FFFFFF" : "#BBBBBB"} />
            </TouchableOpacity>
          </View>
        </View>

        {showGithubIntegration && (
          <View style={styles.githubIntegrationContainer}>
            <Text style={styles.integrationTitle}>GitHub Integration</Text>
            <TouchableOpacity style={styles.selectAgentButton} onPress={() => setShowAGiXTModal(true)}>
              <Text style={styles.selectAgentButtonText}>Select Agent</Text>
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Enter a task"
              placeholderTextColor="#FFFFFF80"
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.taskList}
          />
        </KeyboardAvoidingView>

        <EditTaskModal
          visible={showEditModal}
          task={selectedTask}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveTask}
          repositories={repositories}
          allTasks={tasks}
        />

        <AGiXTModal
          visible={showAGiXTModal}
          onClose={() => setShowAGiXTModal(false)}
          onAgentSelect={handleAgentSelect}
          chains={chains}
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
        />

        <AGiXTOptionsModal
          visible={showAGiXTOptionsModal}
          onClose={() => setShowAGiXTOptionsModal(false)}
          onOptionSelect={handleAGiXTOptionSelect}
        />

        <SubtaskClarificationModal
          visible={showSubtaskClarificationModal}
          onClose={() => setShowSubtaskClarificationModal(false)}
          onContinue={handleGetSubtasks}
          clarificationText={subtaskClarificationText}
          onChangeClarificationText={setSubtaskClarificationText}
          isLoading={isLoading}
        />

        <AlertModal
          visible={showAlertModal}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlertModal(false)}
        />

        {isLoading && <LoadingOverlay />}
      </LinearGradient>
    </SafeAreaView>
  );
}

const TaskItem = React.memo(({ task, onEdit, onRemove, onAGiXTOptions, onToggleComplete, showDependencies, allTasks }) => {
  const renderTextWithLinks = (text) => {
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

  const getDependencyNames = (dependencyIds) => {
    return dependencyIds.map(id => {
      const dependentTask = allTasks.find(t => t.id === id);
      return dependentTask ? dependentTask.text : 'Unknown Task';
    }).join(', ');
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#FF4136';
      case 'medium':
        return '#FF851B';
      case 'low':
        return '#2ECC40';
      default:
        return '#7FDBFF';
    }
  };

  return (
    <View style={[styles.taskContainer, task.completed && styles.completedTask]}>
      <TouchableOpacity onPress={() => onToggleComplete(task.id)} style={styles.taskCheckbox}>
        <MaterialIcons 
          name={task.completed ? "check-box" : "check-box-outline-blank"} 
          size={24} 
          color={task.completed ? "#4CAF50" : "#FFFFFF"}
        />
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <Text style={[styles.taskText, task.completed && styles.completedTaskText]}>{task.text}</Text>
        {task.note && <Text style={styles.noteText}>{renderTextWithLinks(task.note)}</Text>}
        {task.dueDate && (
          <Text style={styles.dueDateText}>
            Due: {new Date(task.dueDate).toLocaleString()}
          </Text>
        )}
        {task.priority && (
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
        )}
        {task.repo && (
          <View style={styles.repoBadge}>
            <MaterialIcons name="code" size={16} color="#FFFFFF" />
            <Text style={styles.repoText}>{task.repo}</Text>
          </View>
        )}
        {task.recurrence && (
          <View style={styles.recurrenceBadge}>
            <MaterialIcons name="repeat" size={16} color="#FFFFFF" />
            <Text style={styles.recurrenceText}>{task.recurrence}</Text>
          </View>
        )}
        {showDependencies && task.dependencies && task.dependencies.length > 0 && (
          <Text style={styles.dependenciesText}>
            Dependencies: {getDependencyNames(task.dependencies)}
          </Text>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={styles.subtasksTitle}>Subtasks:</Text>
            {task.subtasks.map((subtask, index) => (
              <Text key={subtask.id} style={styles.subtaskText}>
                {index + 1}. {subtask.text}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(task)}>
          <MaterialIcons name="edit" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onAGiXTOptions(task)}>
          <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onRemove(task.id)}>
          <MaterialIcons name="delete" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const EditTaskModal = ({ visible, task, onClose, onSave, repositories, allTasks }) => {
  const [editedTask, setEditedTask] = useState(null);
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (task) {
      setEditedTask({
        id: task.id,
        text: task.text || '',
        note: task.note || '',
        priority: task.priority || '',
        repo: task.repo || '',
        subtasks: task.subtasks || [],
        dependencies: task.dependencies || [],
        recurrence: task.recurrence || null,
        completed: task.completed || false,
      });
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    } else {
      setEditedTask(null);
      setDueDate(null);
    }
  }, [task]);

  const handleChange = (field, value) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, [field]: value });
    }
  };

  const handleSave = () => {
    if (editedTask) {
      onSave({ ...editedTask, dueDate: dueDate });
    }
  };

  const toggleDependency = (taskId) => {
    const updatedDependencies = editedTask.dependencies.includes(taskId)
      ? editedTask.dependencies.filter(id => id !== taskId)
      : [...editedTask.dependencies, taskId];
    handleChange('dependencies', updatedDependencies);
  };

  const removeDueDate = () => {
    setDueDate(null);
  };

  const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <TouchableOpacity onPress={onClick} ref={ref} style={styles.datePickerButton}>
      <Text style={styles.datePickerButtonText}>
        {value || "Select due date"}
      </Text>
    </TouchableOpacity>
  ));

  if (!editedTask) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <InputField
              label="Task Name"
              value={editedTask.text}
              onChangeText={(text) => handleChange('text', text)}
            />
            
            <InputField
              label="Description"
              value={editedTask.note}
              onChangeText={(text) => handleChange('note', text)}
              multiline
            />
            
            <View style={styles.datePickerContainer}>
              <Text style={styles.inputLabel}>Due Date</Text>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="No Due Date Set"
                customInput={<ExampleCustomInput />}
              />
              {dueDate && (
                <TouchableOpacity
                  style={styles.removeDueDateButton}
                  onPress={removeDueDate}
                >
                  <Text style={styles.buttonText}>Remove Due Date</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <PickerField
              label="Priority"
              value={editedTask.priority}
              onValueChange={(value) => handleChange('priority', value)}
              items={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
            />
            
            <PickerField
              label="Repository"
              value={editedTask.repo}
              onValueChange={(value) => handleChange('repo', value)}
              items={repositories.map(repo => ({ label: repo.name, value: repo.name }))}
            />

            <PickerField
              label="Recurrence"
              value={editedTask.recurrence}
              onValueChange={(value) => handleChange('recurrence', value)}
              items={[
                { label: 'None', value: null },
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ]}
            />
            
            <SubtasksList
              subtasks={editedTask.subtasks}
              onSubtasksChange={(subtasks) => handleChange('subtasks', subtasks)}
            />

            <DependencyList
              allTasks={allTasks}
              currentTaskId={editedTask.id}
              dependencies={editedTask.dependencies}
              onToggleDependency={toggleDependency}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InputField = ({ label, value, onChangeText, multiline = false }) => (
  <View style={styles.inputField}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      placeholderTextColor="#FFFFFF80"
    />
  </View>
);

const PickerField = ({ label, value, onValueChange, items }) => (
  <View style={styles.inputField}>
    <Text style={styles.inputLabel}>{label}</Text>
    <Picker
      selectedValue={value}
      onValueChange={onValueChange}
      style={styles.picker}
    >
      {items.map((item) => (
        <Picker.Item key={item.value} label={item.label} value={item.value} color="#FFFFFF" />
      ))}
    </Picker>
  </View>
);

const SubtasksList = ({ subtasks, onSubtasksChange }) => {
  const addSubtask = () => {
    onSubtasksChange([...subtasks, { id: Date.now(), text: '' }]);
  };

  const updateSubtask = (id, text) => {
    onSubtasksChange(subtasks.map(st => st.id === id ? { ...st, text } : st));
  };

  const removeSubtask = (id) => {
    onSubtasksChange(subtasks.filter(st => st.id !== id));
  };

  return (
    <View style={styles.subtasksList}>
      <Text style={styles.inputLabel}>Subtasks</Text>
      {subtasks.map((subtask) => (
        <View key={subtask.id} style={styles.subtaskItem}>
          <TextInput
            style={styles.subtaskInput}
            value={subtask.text}
            onChangeText={(text) => updateSubtask(subtask.id, text)}
            placeholderTextColor="#FFFFFF80"
          />
          <TouchableOpacity onPress={() => removeSubtask(subtask.id)}>
            <MaterialIcons name="remove-circle-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
        <MaterialIcons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.addSubtaskText}>Add Subtask</Text>
      </TouchableOpacity>
    </View>
  );
};

const DependencyList = ({ allTasks, currentTaskId, dependencies, onToggleDependency }) => {
  return (
    <View style={styles.dependencyList}>
      <Text style={styles.inputLabel}>Dependencies</Text>
      {allTasks
        .filter(task => task.id !== currentTaskId)
        .map(task => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.dependencyItem,
              dependencies.includes(task.id) && styles.dependencyItemSelected
            ]}
            onPress={() => onToggleDependency(task.id)}
          >
            <Text style={styles.dependencyItemText}>{task.text}</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  );
};

const AGiXTModal = ({ visible, onClose, onAgentSelect, chains, agents, selectedAgent, setSelectedAgent }) => {
  const [selectedChain, setSelectedChain] = useState("");
  const [chainInput, setChainInput] = useState("");

  const handleOk = () => {
    onAgentSelect(selectedAgent, selectedChain, chainInput);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select an Agent and Chain</Text>
          {agents.length > 0 ? (
            <Picker
              selectedValue={selectedAgent}
              onValueChange={setSelectedAgent}
              style={styles.agentPicker}
            >
              {agents.map((agent) => (
                <Picker.Item key={agent.name} label={agent.name} value={agent.name} color="#FFFFFF" />
              ))}
            </Picker>
          ) : (
            <Text style={styles.noAgentsText}>No agents available</Text>
          )}
          <Picker
            selectedValue={selectedChain}
            onValueChange={setSelectedChain}
            style={styles.chainPicker}
          >
            {chains.map((chain) => (
              <Picker.Item key={chain} label={chain} value={chain} color="#FFFFFF" />
            ))}
          </Picker>
          <TextInput
            style={styles.chainInput}
            value={chainInput}
            onChangeText={setChainInput}
            placeholder="Enter chain input"
            placeholderTextColor="#FFFFFF80"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonOk]} onPress={handleOk}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AGiXTOptionsModal = ({ visible, onClose, onOptionSelect }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>AGiXT Options</Text>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => onOptionSelect('getSubtasks')}
          >
            <Text style={styles.modalOptionText}>Get Subtasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => onOptionSelect('runChain')}
          >
            <Text style={styles.modalOptionText}>Run Chain</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SubtaskClarificationModal = ({ visible, onClose, onContinue, clarificationText, onChangeClarificationText, isLoading }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Get Subtasks Clarification</Text>
          <TextInput
            style={styles.clarificationInput}
            value={clarificationText}
            onChangeText={onChangeClarificationText}
            placeholder="Enter optional clarification text"
            placeholderTextColor="#FFFFFF80"
            multiline
            editable={!isLoading}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonOk]} onPress={onContinue} disabled={isLoading}>
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

const AlertModal = ({ visible, title, message, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.alertOverlay}>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2C3E50',
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
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  integrationBar: {
    flexDirection: 'row',
  },
  integrationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  integrationButtonActive: {
    backgroundColor: '#3498DB',
  },
  githubIntegrationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  integrationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectAgentButton: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectAgentButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#3498DB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskList: {
    paddingBottom: 20,
  },
  taskContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTask: {
    opacity: 0.6,
  },
  taskCheckbox: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
  },
  noteText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
  },
  dueDateText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  repoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  repoText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  recurrenceText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  dependenciesText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
  },
  subtasksContainer: {
    marginTop: 10,
  },
  subtasksTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtaskText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginLeft: 10,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#34495E',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    maxHeight: '70%',
  },
  inputField: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  datePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
  },
  removeDueDateButton: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#E74C3C',
    borderRadius: 5,
    alignItems: 'center',
  },
  picker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  },
  subtasksList: {
    marginTop: 15,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtaskInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSubtaskText: {
    color: '#3498DB',
    marginLeft: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  saveButton: {
    backgroundColor: '#2ECC71',
  },
  agentPicker: {
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  chainPicker: {
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  chainInput: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonCancel: {
    backgroundColor: '#E74C3C',
  },
  buttonOk: {
    backgroundColor: '#2ECC71',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  link: {
    color: '#3498DB',
    textDecorationLine: 'underline',
  },
  dependencyList: {
    marginTop: 15,
  },
  dependencyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  dependencyItemSelected: {
    backgroundColor: '#3498DB',
  },
  dependencyItemText: {
    color: '#FFFFFF',
  },
  clarificationInput: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  noAgentsText: {
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    backgroundColor: '#34495E',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertMessage: {
    color: '#FFFFFF',
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TaskPanel;