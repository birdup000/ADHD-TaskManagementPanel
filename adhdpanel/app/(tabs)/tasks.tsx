import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AGiXTSDK from 'agixt';

const AGIXT_API_URI_KEY = 'agixtapi';
const AGIXT_API_KEY_KEY = 'agixtkey';

interface Task {
  id: number;
  text: string;
  description?: string;
  dueDate?: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  subtasks: Task[];
  conversationId?: string;
  conversationLog: { role: string; message: string }[];
  completed: boolean;
}

const TaskPanel = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [agixtApiUri, setAgixtApiUri] = useState('');
  const [agixtApiKey, setAgixtApiKey] = useState('');
  const [agents, setAgents] = useState<{ name: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [chains, setChains] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState('');
  const [chainInput, setChainInput] = useState('');
  const [showAgentChainModal, setShowAgentChainModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTaskForAGiXT, setSelectedTaskForAGiXT] = useState<Task | null>(
    null
  );

  useEffect(() => {
    loadAgixtConfig();
    loadTasks();
  }, []);

  const loadAgixtConfig = async () => {
    try {
      const storedUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
      const storedKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);

      if (storedUri && storedKey) {
        setAgixtApiUri(storedUri);
        setAgixtApiKey(storedKey);
        await fetchAgents();
        await fetchChains();
      } else {
        showAlert(
          'Configuration Missing',
          'AGiXT API URI or API Key is not set. Please configure them in settings.'
        );
      }
    } catch (error) {
      console.error('Error loading AGiXT configuration:', error);
      showAlert(
        'Error',
        'Failed to load AGiXT configuration. Please check your settings.'
      );
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        // Ensure loaded tasks conform to the Task interface
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        const validTasks = parsedTasks.map((task) => ({
          ...task,
          priority: ['Low', 'Medium', 'High'].includes(task.priority)
            ? task.priority
            : 'Low',
          status: ['Pending', 'Running', 'Completed', 'Failed'].includes(
            task.status
          )
            ? task.status
            : 'Pending',
          completed: Boolean(task.completed), // Ensure completed is a boolean
        }));
        setTasks(validTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      showAlert('Error', 'Failed to load tasks.');
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      showAlert('Error', 'Failed to save tasks.');
    }
  };

  const fetchAgents = async () => {
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      const agentList = await agixt.getAgents();
      setAgents(
        (agentList as any[]).map((agent: any) => ({ name: agent.name }))
      );
      if (agentList.length > 0) {
        setSelectedAgent(agentList[0].name);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      showAlert('Error', 'Failed to fetch agents.');
    }
  };

  const fetchChains = async () => {
    try {
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });
      const chainList: string[] = await agixt.getChains() as string[];
      setChains(chainList);
      if (chainList.length > 0) {
        setSelectedChain(chainList[0]);
      }
    } catch (error) {
      console.error('Error fetching chains:', error);
      showAlert('Error', 'Failed to fetch chains.');
    }
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const addTask = () => {
    if (newTaskText.trim() === '') return;

    const newTask: Task = {
      id: Date.now(),
      text: newTaskText.trim(),
      description: newTaskDescription,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      status: 'Pending',
      subtasks: [],
      conversationLog: [],
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskDescription('');
    setNewTaskDueDate(undefined);
    setNewTaskPriority('Low');
    saveTasks();
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    saveTasks();
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const closeEditTaskModal = () => {
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const saveTaskChanges = () => {
    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? editingTask : task
        )
      );
      saveTasks();
    }
    closeEditTaskModal();
  };

  const toggleTaskComplete = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    saveTasks();
  };

  const handleGenerateSubtasks = async (task: Task) => {
    if (!selectedAgent) {
      showAlert(
        'No Agent Selected',
        'Please select an agent before generating subtasks.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });

      const conversationName = `Subtasks_${task.id}`;
      const conversation = await agixt.newConversation(
        selectedAgent,
        conversationName
      );
      task.conversationId = conversationName;

      const userInput = `Generate subtasks for the following task:
Task Name: ${task.text}
Description: ${task.description || 'No description provided'}
Due Date: ${
        task.dueDate ? task.dueDate.toLocaleDateString() : 'Not set'
      }
Priority: ${task.priority}

Please provide a list of 3-5 subtasks for this main task. Each subtask should be specific, measurable, and contribute to the completion of the main task. Format the response as a JSON array of objects, where each object has 'id', 'text', and 'completed' properties.`;

      const result = await agixt.chat(
        selectedAgent,
        userInput,
        conversationName,
        4
      );

      const subtasks = parseSubtasks(result);
      const updatedTask = {
        ...task,
        subtasks: subtasks,
        status: 'Pending' as const,
      };
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      saveTasks();

      updateConversationLog(updatedTask, 'Agent', result);
    } catch (error) {
      console.error('Error generating subtasks:', error);
      showAlert('Error', 'Failed to generate subtasks.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseSubtasks = (result: string): Task[] => {
    try {
      const startIndex = result.indexOf('```\n[') + 4;
      const endIndex = result.lastIndexOf(']\n```');

      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find JSON array in the response');
      }

      const jsonString = result.substring(startIndex, endIndex + 1);
      const parsedResult = JSON.parse(jsonString);

      if (!Array.isArray(parsedResult)) {
        throw new Error('Parsed result is not an array');
      }

      return parsedResult.map((subtask: any) => ({
        id: Date.now() + Math.random(),
        text: subtask.text,
        description: '',
        priority: 'Low',
        status: 'Pending',
        subtasks: [],
        conversationLog: [],
        completed: false,
      }));
    } catch (error) {
      console.error('Error parsing subtasks:', error);
      showAlert(
        'Error',
        "Failed to parse subtasks. Please check the agent's response format."
      );
      return [];
    }
  };

  const handleRunChain = async (task: Task) => {
    if (!selectedAgent || !selectedChain) {
      showAlert(
        'Agent and Chain Required',
        'Please select both an agent and a chain.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });

      const conversationName =
        task.conversationId || `Chain_${task.id}`;
      if (!task.conversationId) {
        await agixt.newConversation(selectedAgent, conversationName);
        task.conversationId = conversationName;
      }

      const result = await agixt.runChain(
        selectedChain,
        chainInput,
        selectedAgent,
        false,
        1,
        {
          conversation_name: conversationName,
        }
      );

      const updatedTask = { ...task, status: 'Running' as const };
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      saveTasks();

      updateConversationLog(updatedTask, 'Agent', result);
    } catch (error) {
      console.error('Error running chain:', error);
      showAlert('Error', 'Failed to run chain.');
      const updatedTask = { ...task, status: 'Failed' as const };
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversationLog = (
    task: Task,
    role: string,
    message: string
  ) => {
    const updatedTask = {
      ...task,
      conversationLog: [...task.conversationLog, { role, message }],
    };
    setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    saveTasks();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, darkMode && styles.darkModeTaskItem]}>
      <View style={styles.taskHeader}>
        <Text style={[styles.taskText, darkMode && styles.darkModeText]}>
          {item.text}
        </Text>
        <View style={styles.taskActions}>
          <TouchableOpacity onPress={() => openEditTaskModal(item)}>
            <MaterialIcons
              name="edit"
              size={24}
              color={darkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <MaterialIcons
              name="delete"
              size={24}
              color={darkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </View>
      {item.description && (
        <Text
          style={[styles.taskDescription, darkMode && styles.darkModeText]}
        >
          {item.description}
        </Text>
      )}
      <View style={styles.taskDetails}>
        {item.dueDate && (
          <Text
            style={[styles.taskDueDate, darkMode && styles.darkModeText]}
          >
            Due: {item.dueDate.toLocaleDateString()}
          </Text>
        )}
        <Text
          style={[
            styles.taskPriority,
            darkMode && styles.darkModeText,
            getPriorityStyle(item.priority),
          ]}
        >
          {item.priority}
        </Text>
        <Text
          style={[
            styles.taskStatus,
            darkMode && styles.darkModeText,
            getStatusStyle(item.status),
          ]}
        >
          {item.status}
        </Text>
      </View>
      <View style={styles.agixtButtons}>
        <TouchableOpacity
          style={styles.agixtButton}
          onPress={() => {
            setSelectedTaskForAGiXT(item);
            handleGenerateSubtasks(item);
          }}
        >
          <Text style={styles.agixtButtonText}>Generate Subtasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.agixtButton}
          onPress={() => {
            setSelectedTaskForAGiXT(item);
            setShowAgentChainModal(true);
          }}
        >
          <Text style={styles.agixtButtonText}>Run Chain</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={item.subtasks}
        keyExtractor={(subtask) => subtask.id.toString()}
        renderItem={renderSubtaskItem}
        style={styles.subtaskList}
      />
      {item.conversationLog && ( // Check if conversationLog is defined
        <View style={styles.conversationLog}>
          {item.conversationLog.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text
                style={[
                  styles.logRole,
                  darkMode && styles.darkModeText,
                  log.role === 'User'
                    ? styles.userLogRole
                    : styles.agentLogRole,
                ]}
              >
                {log.role}:
              </Text>
              <Text
                style={[styles.logMessage, darkMode && styles.darkModeText]}
              >
                {log.message}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSubtaskItem = ({ item }: { item: Task }) => (
    <View
      style={[styles.subtaskItem, darkMode && styles.darkModeSubtaskItem]}
    >
      <View style={styles.taskHeader}>
        <Text style={[styles.subtaskText, darkMode && styles.darkModeText]}>
          {item.text}
        </Text>
        <View style={styles.taskActions}>
          <TouchableOpacity onPress={() => openEditTaskModal(item)}>
            <MaterialIcons
              name="edit"
              size={20}
              color={darkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <MaterialIcons
              name="delete"
              size={20}
              color={darkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.taskDetails}>
        <Text
          style={[
            styles.taskPriority,
            darkMode && styles.darkModeText,
            getPriorityStyle(item.priority),
          ]}
        >
          {item.priority}
        </Text>
        <Text
          style={[
            styles.taskStatus,
            darkMode && styles.darkModeText,
            getStatusStyle(item.status),
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  const getPriorityStyle = (
    priority: 'Low' | 'Medium' | 'High'
  ) => {
    switch (priority) {
      case 'High':
        return styles.highPriority;
      case 'Medium':
        return styles.mediumPriority;
      default:
        return styles.lowPriority;
    }
  };

  const getStatusStyle = (
    status: 'Pending' | 'Running' | 'Completed' | 'Failed'
  ) => {
    switch (status) {
      case 'Completed':
        return styles.completedStatus;
      case 'Running':
        return styles.runningStatus;
      case 'Failed':
        return styles.failedStatus;
      default:
        return styles.pendingStatus;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, darkMode && styles.darkModeContainer]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkModeText]}>
          Task Panel
        </Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.addTaskContainer}
      >
        <TextInput
          style={[styles.input, darkMode && styles.darkModeInput]}
          placeholder="Add a task..."
          placeholderTextColor={
            darkMode ? '#FFFFFF80' : '#00000080'
          }
          value={newTaskText}
          onChangeText={setNewTaskText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        style={styles.taskList}
      />

      <Modal visible={showTaskModal} animationType="slide" transparent>
        <View
          style={[
            styles.modalContainer,
            darkMode && styles.darkModeModalContainer,
          ]}
        >
          <View
            style={[
              styles.modalContent,
              darkMode && styles.darkModeModalContent,
            ]}
          >
            <Text
              style={[styles.modalTitle, darkMode && styles.darkModeText]}
            >
              {editingTask ? 'Edit Task' : 'Add Task'}
            </Text>
            <TextInput
              style={[styles.input, darkMode && styles.darkModeInput]}
              placeholder="Task name"
              placeholderTextColor={
                darkMode ? '#FFFFFF80' : '#00000080'
              }
              value={editingTask?.text}
              onChangeText={(text) =>
                setEditingTask((prev) =>
                  prev ? { ...prev, text } : null
                )
              }
            />
            <TextInput
              style={[styles.input, darkMode && styles.darkModeInput]}
              placeholder="Description (optional)"
              placeholderTextColor={
                darkMode ? '#FFFFFF80' : '#00000080'
              }
              value={editingTask?.description}
              onChangeText={(text) =>
                setEditingTask((prev) =>
                  prev ? { ...prev, description: text } : null
                )
              }
            />
            <View style={styles.pickerContainer}>
              <Text
                style={[styles.pickerLabel, darkMode && styles.darkModeText]}
              >
                Priority:
              </Text>
              <Picker
                selectedValue={
                  editingTask?.priority || newTaskPriority
                }
                style={[styles.picker, darkMode && styles.darkModePicker]}
                onValueChange={(itemValue) =>
                  editingTask
                    ? setEditingTask((prev) =>
                        prev
                          ? { ...prev, priority: itemValue as Task['priority'] }
                          : null
                      )
                    : setNewTaskPriority(itemValue)
                }
              >
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeEditTaskModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveTaskChanges}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAgentChainModal}
        animationType="slide"
        transparent
      >
        <View
          style={[
            styles.modalContainer,
            darkMode && styles.darkModeModalContainer,
          ]}
        >
          <View
            style={[
              styles.modalContent,
              darkMode && styles.darkModeModalContent,
            ]}
          >
            <Text
              style={[styles.modalTitle, darkMode && styles.darkModeText]}
            >
              Run AGiXT
            </Text>
            <View style={styles.pickerContainer}>
              <Text
                style={[styles.pickerLabel, darkMode && styles.darkModeText]}
              >
                Agent:
              </Text>
              <Picker
                selectedValue={selectedAgent}
                style={[styles.picker, darkMode && styles.darkModePicker]}
                onValueChange={(itemValue) =>
                  setSelectedAgent(itemValue)
                }
              >
                {agents.map((agent) => (
                  <Picker.Item
                    key={agent.name}
                    label={agent.name}
                    value={agent.name}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Text
                style={[styles.pickerLabel, darkMode && styles.darkModeText]}
              >
                Chain:
              </Text>
              <Picker
                selectedValue={selectedChain}
                style={[styles.picker, darkMode && styles.darkModePicker]}
                onValueChange={(itemValue) =>
                  setSelectedChain(itemValue)
                }
              >
                {Array.isArray(chains) && // Check if chains is an array
                  chains.map((chain) => (
                    <Picker.Item key={chain} label={chain} value={chain} />
                  ))}
              </Picker>
            </View>
            <TextInput
              style={[styles.input, darkMode && styles.darkModeInput]}
              placeholder="Chain input (optional)"
              placeholderTextColor={
                darkMode ? '#FFFFFF80' : '#00000080'
              }
              value={chainInput}
              onChangeText={setChainInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAgentChainModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowAgentChainModal(false);
                  if (selectedTaskForAGiXT) {
                    handleRunChain(selectedTaskForAGiXT);
                  }
                }}
              >
                <Text style={styles.buttonText}>Run</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  darkModeContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  darkModeText: {
    color: '#FFFFFF',
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  darkModeInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  darkModeTaskItem: {
    backgroundColor: '#333333',
    borderColor: '#555555',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  taskActions: {
    flexDirection: 'row',
  },
  taskDescription: {
    color: '#666666',
    marginTop: 5,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  taskDueDate: {
    color: '#666666',
    marginRight: 10,
  },
  taskPriority: {
    marginRight: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  taskStatus: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  highPriority: {
    backgroundColor: '#F44336',
    color: '#FFFFFF',
  },
  mediumPriority: {
    backgroundColor: '#FFC107',
    color: '#000000',
  },
  lowPriority: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
  },
  completedStatus: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
  },
  runningStatus: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
  },
  failedStatus: {
    backgroundColor: '#F44336',
    color: '#FFFFFF',
  },
  pendingStatus: {
    backgroundColor: '#9E9E9E',
    color: '#FFFFFF',
  },
  agixtButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  agixtButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  agixtButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subtaskList: {
    marginTop: 10,
  },
  subtaskItem: {
    backgroundColor: '#EEEEEE',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  darkModeSubtaskItem: {
    backgroundColor: '#444444',
    borderColor: '#666666',
  },
  subtaskText: {
    fontSize: 16,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  darkModeModalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  darkModeModalContent: {
    backgroundColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000000',
  },
  picker: {
    height: 40,
    color: '#000000',
  },
  darkModePicker: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationLog: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
  },
  logItem: {
    marginBottom: 5,
  },
  logRole: {
    fontWeight: 'bold',
  },
  userLogRole: {
    color: '#2196F3',
  },
  agentLogRole: {
    color: '#4CAF50',
  },
  logMessage: {
    marginLeft: 10,
  },
});

export default TaskPanel;