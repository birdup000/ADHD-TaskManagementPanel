import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from '@react-native-picker/picker';
import AGiXTSDK from "agixt";

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";
const ALWAYS_USE_AGENT_KEY = "alwaysUseAgent";

export default function TaskPanel() {
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [showAGiXTModal, setShowAGiXTModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState(null);
  const [chains, setChains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agixtApiUri, setAgixtApiUri] = useState("");
  const [agixtApiKey, setAgixtApiKey] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("");
  const [showAGiXTOptionsModal, setShowAGiXTOptionsModal] = useState(false);
  const [selectedTaskForAGiXT, setSelectedTaskForAGiXT] = useState(null);
  const [chainInput, setChainInput] = useState("");
  const [isChainRunning, setIsChainRunning] = useState(false);
  const [showSubtaskClarificationModal, setShowSubtaskClarificationModal] = useState(false);
  const [subtaskClarificationText, setSubtaskClarificationText] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showGithubIntegration, setShowGithubIntegration] = useState(false);
  const [showDependentTasks, setShowDependentTasks] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      await loadGithubData();
      await loadAgixtData();
      await loadTasks();
      await getChains();
      await getAgents();
      await fetchRepositories();
    };

    loadInitialData();

    // Set up interval to check for recurring tasks
    const interval = setInterval(handleRecurringTasks, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadGithubData = async () => {
    try {
      const storedGithubUsername = await AsyncStorage.getItem('githubUsername');
      if (storedGithubUsername) {
        setGithubUsername(storedGithubUsername);
      }
    } catch (error) {
      console.log('Error getting GitHub username from AsyncStorage:', error);
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
      console.log('Error getting AGiXT data from AsyncStorage:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.log("Error loading tasks:", error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.log("Error saving tasks:", error);
    }
  };

  const getChains = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    }
  };

  const fetchRepositories = async () => {
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      
      const conversationName = "GitHub Repositories";
      
      // Create a new conversation
      await agixt.newConversation(selectedAgent, conversationName);
      
      const result = await agixt.executeCommand(
        selectedAgent,
        "Get List of My Github Repositories",
        {}, // No additional arguments needed for this command
        conversationName
      );

      if (typeof result === 'string') {
        // If the result is a string, parse it as JSON
        const parsedRepos = JSON.parse(result);
        setRepositories(parsedRepos);
      } else if (Array.isArray(result)) {
        // If the result is already an array, use it directly
        setRepositories(result);
      } else {
        console.error("Unexpected repository data format:", result);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  const addTask = () => {
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
      };
      const updatedTasks = [...tasks, newTask];
      saveTasks(updatedTasks);
      setNewTaskText("");
      setNewTaskPriority("");
    }
  };

  const removeTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks);
  };

  const editTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleSaveTask = (editedTask) => {
    const updatedTasks = tasks.map((task) =>
      task.id === editedTask.id ? editedTask : task
    );
    saveTasks(updatedTasks);
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleAgentSelect = async (agent, chain, input) => {
    setShowAGiXTModal(false);
    if (chain) {
      await executeChain(agent, chain, input);
    }
  };

  const executeChain = async (agent, chain, input) => {
    try {
      setIsLoading(true);
      setIsChainRunning(true);
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      const result = await agixt.runChain(chain, input, agent);
      console.log("Chain execution result:", result);
    } catch (error) {
      console.error("Error executing chain:", error);
    } finally {
      setIsLoading(false);
      setIsChainRunning(false);
    }
  };

  const handleAGiXTOptionSelect = async (option) => {
    if (option === 'getSubtasks') {
      setShowSubtaskClarificationModal(true);
    } else if (option === 'runChain') {
      setShowAGiXTModal(true);
    }
    setShowAGiXTOptionsModal(false);
  };

  const handleGetSubtasks = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecurringTasks = () => {
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Task Manager</Text>
      </View>

      <View style={styles.integrationBar}>
        <TouchableOpacity
          style={[styles.integrationButton, showGithubIntegration && styles.integrationButtonActive]}
          onPress={() => setShowGithubIntegration(!showGithubIntegration)}
        >
          <Icon name="github" size={24} color={showGithubIntegration ? "#FFFFFF" : "#BBBBBB"} />
          <Text style={[styles.integrationButtonText, showGithubIntegration && styles.integrationButtonTextActive]}>
            GitHub
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.integrationButton, showDependentTasks && styles.integrationButtonActive]}
          onPress={() => setShowDependentTasks(!showDependentTasks)}
        >
          <Icon name="account-tree" size={24} color={showDependentTasks ? "#FFFFFF" : "#BBBBBB"} />
          <Text style={[styles.integrationButtonText, showDependentTasks && styles.integrationButtonTextActive]}>
            Dependencies
          </Text>
        </TouchableOpacity>
      </View>

      {showGithubIntegration && (
        <View style={styles.githubIntegrationContainer}>
          <Text style={styles.integrationTitle}>GitHub Integration</Text>
          <TouchableOpacity style={styles.selectAgentButton} onPress={() => setShowAGiXTModal(true)}>
            <Text style={styles.selectAgentButtonText}>Select Agent</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholder="Enter a task"
          placeholderTextColor="#FFFFFF80"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onEdit={() => editTask(item)}
            onRemove={() => removeTask(item.id)}
            onAGiXTOptions={(task) => {
              setSelectedTaskForAGiXT(task);
              setShowAGiXTOptionsModal(true);
            }}
            chains={chains}
            isLoading={isLoading}
            isChainRunning={isChainRunning}
            showDependencies={showDependentTasks}
          />
        )}
      />

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
        agixtApiUri={agixtApiUri}
        agixtApiKey={agixtApiKey}
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
    </View>
  );
}

const TaskItem = ({ task, onEdit, onRemove, onAGiXTOptions, chains, isLoading, isChainRunning, showDependencies }) => {
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

  return (
    <View style={[
      styles.taskContainer,
      isChainRunning && styles.taskRunningAnimation
    ]}>
      <View style={styles.taskInfoContainer}>
        <Text style={styles.taskText}>{task.text}</Text>
        {task.note && <Text style={styles.noteText}>Note: {renderTextWithLinks(task.note)}</Text>}
        {task.dueDate && (
          <Text style={styles.dueDateText}>
            Due: {new Date(task.dueDate).toLocaleString()}
          </Text>
        )}
        {task.priority && (
          <Text style={styles.priorityText}>Priority: {task.priority}</Text>
        )}
        {task.repo && (
          <Text style={styles.repoText}>Repo: {task.repo}</Text>
        )}
        {task.recurrence && (
          <Text style={styles.recurrenceText}>Recurs: {task.recurrence}</Text>
        )}
        {showDependencies && task.dependencies && task.dependencies.length > 0 && (
          <Text style={styles.dependenciesText}>Dependencies: {task.dependencies.join(', ')}</Text>
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
      <View style={styles.taskButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Icon name="edit" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onAGiXTOptions(task)}
        >
          <Icon name="play-arrow" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Icon name="delete" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {isChainRunning && <ChainRunningAnimation />}
    </View>
  );
};

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
              <Icon name="close" size={24} color="#FFFFFF" />
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
        <Picker.Item key={item.value} label={item.label} value={item.value} />
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
            <Icon name="remove-circle-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
        <Icon name="add-circle-outline" size={24} color="#007AFF" />
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

const AGiXTModal = ({ visible, onClose, onAgentSelect, agixtApiUri, agixtApiKey, chains, agents, selectedAgent, setSelectedAgent }) => {
  const [selectedChain, setSelectedChain] = useState("");
  const [chainInput, setChainInput] = useState("");

  const handleOk = () => {
    onAgentSelect(selectedAgent, selectedChain, chainInput);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select an Agent and Chain</Text>
          {agents.length > 0 ? (
            <Picker
              selectedValue={selectedAgent}
              onValueChange={setSelectedAgent}
              style={styles.agentPicker}
            >
              {agents.map((agent) => (
                <Picker.Item key={agent.name} label={agent.name} value={agent.name} />
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
              <Picker.Item key={chain} label={chain} value={chain} />
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

const ChainRunningAnimation = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.chainRunningOverlay}>
      <View style={styles.chainRunningContent}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="settings" size={48} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.chainRunningText}>AUTOMATION TASK</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  topBar: {
    backgroundColor: '#007AFF',
    padding: 15,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  integrationBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  integrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  integrationButtonActive: {
    backgroundColor: '#007AFF',
  },
  integrationButtonText: {
    color: '#BBBBBB',
    marginLeft: 5,
  },
  integrationButtonTextActive: {
    color: '#FFFFFF',
  },
  githubIntegrationContainer: {
    backgroundColor: '#2C2C2C',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  integrationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectAgentButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectAgentButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskRunningAnimation: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  taskInfoContainer: {
    flex: 1,
  },
  taskText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  priorityText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
  },
  repoText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
  },
  recurrenceText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
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
  taskButtonsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  removeButton: {
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
    backgroundColor: '#1E1E1E',
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
    zIndex: 9999,
  },
  datePickerButton: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 5,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
  },
  picker: {
    backgroundColor: '#2C2C2C',
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
    backgroundColor: '#2C2C2C',
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
    color: '#007AFF',
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
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  agentPicker: {
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: '#2C2C2C',
    marginBottom: 10,
  },
  chainPicker: {
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: '#2C2C2C',
    marginBottom: 10,
  },
  chainInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#2C2C2C',
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
    backgroundColor: '#FF3B30',
  },
  buttonOk: {
    backgroundColor: '#007AFF',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF40',
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chainRunningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  chainRunningContent: {
    alignItems: 'center',
  },
  chainRunningText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  dependencyList: {
    marginTop: 15,
  },
  dependencyItem: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  dependencyItemSelected: {
    backgroundColor: '#007AFF',
  },
  dependencyItemText: {
    color: '#FFFFFF',
  },
  clarificationInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#2C2C2C',
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
});

export default TaskPanel;