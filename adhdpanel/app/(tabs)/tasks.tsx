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
  Alert,
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AGiXTSDK from "agixt";
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

const GENERATE_SUBTASKS_PROMPT = `
Given the following task details:
Task Name: {taskName}
Description: {taskDescription}
Due Date: {dueDate}
Priority: {priority}
Additional Context: {additionalContext}

Generate a list of 3-5 subtasks that break down this main task into smaller, actionable items. Each subtask should be specific, measurable, and contribute to the completion of the main task. 

Format the response as a JSON array of objects, where each object has the following properties:
- id: A unique identifier (you can use numbers starting from 1)
- text: The description of the subtask
- completed: Boolean value (set to false for new subtasks)

Example format:
[
  {
    "id": 1,
    "text": "Subtask description here",
    "completed": false
  },
  ...
]
`;

interface Task {
  id: number;
  text: string;
  description?: string; // Added for compatibility with the first code
  note?: string;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High'; // Changed to match the first code's type
  repo?: string;
  status?: 'Pending' | 'Running' | 'Completed' | 'Failed'; // Added for compatibility with the first code
  subtasks: Task[];
  dependencies?: number[];
  recurrence?: string;
  completed: boolean;
  group: string;
  conversationId?: string; // Added for compatibility with the first code
  conversationLog?: { role: string; message: string }[]; // Added for compatibility with the first code
}

const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const Sidebar = ({ groups, tasks, onGroupSelect, onClose, darkMode }: { groups: string[]; tasks: Task[]; onGroupSelect: (group: string) => void; onClose: () => void; darkMode: boolean }) => {
  const calculateGroupProgress = (groupName: string) => {
    const groupTasks = tasks.filter(task => task.group === groupName);
    const completedTasks = groupTasks.filter(task => task.completed);
    return groupTasks.length > 0 ? (completedTasks.length / groupTasks.length) * 100 : 0;
  };

  const totalProgress = useMemo(() => {
    return tasks.length > 0 ? (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0;
  }, [tasks]);

  return (
    <View style={[styles.sidebar, darkMode && styles.darkModeSidebar]}>
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
            onPress={() => onGroupSelect (group)}
          >
            <Text style={[styles.groupName, darkMode && styles.darkModeText]}>{group}</Text>
            <ProgressBar progress={calculateGroupProgress(group)} color="#2ECC71" />
            <Text style={[styles.groupProgress, darkMode && styles.darkModeText]}>
              {calculateGroupProgress(group).toFixed(0)}%
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const TaskCard = ({ task, onEdit, onRemove, onAGiXTOptions, onToggleComplete, showDependencies, allTasks, darkMode }: { task: Task; onEdit: (task: Task) => void; onRemove: (taskId: number) => void; onAGiXTOptions: (task: Task) => void; onToggleComplete: (taskId: number) => void; showDependencies: boolean; allTasks: Task[]; darkMode: boolean }) => {
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
    transform: [{ scale: animatedValue }],
    opacity: animatedValue,
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Text key={index} style={styles.link} onPress={() => Linking.openURL(part)}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const getDependencyNames = (dependencyIds: number[]) => {
    return dependencyIds
      .map((id) => {
        const dependentTask = allTasks.find((t) => t.id === id);
        return dependentTask ? dependentTask.text : 'Unknown Task';
      })
      .join(', ');
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
              name={task.completed ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={task.completed ? '#4CAF50' : darkMode ? "#FFFFFF" : "#000000"}
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
          <MaterialIcons
            name="edit"
            size={24}
            color={darkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onAGiXTOptions(task)}>
          <MaterialIcons
            name="play-arrow"
            size={24}
            color={darkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onRemove(task.id)}>
          <MaterialIcons
            name="delete"
            size={24}
            color={darkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const TaskDetails = () => (
  <View style={styles.taskDetails}>
    <Text style={styles.taskDetailsInfoText}>
      <Text style={styles.taskDetailsInfoLabel}>Date Created</Text> {" "}
      <Text style={styles.taskDetailsInfoValue}>October 24, 2024 11:45 AM</Text>
    </Text>
    <Text style={styles.taskDetailsInfoText}>
      <Text style={styles.taskDetailsInfoLabel}>Status</Text> {" "}
      <Text style={styles.taskDetailsInfoValue}>Empty</Text>
    </Text>
    <TouchableOpacity style={styles.addPropertyButton}>
      <Text style={styles.addPropertyButtonText}>Add a property</Text>
    </TouchableOpacity>
    <TextInput
      style={styles.commentInput}
      placeholder="Add a comment..."
      placeholderTextColor="#FFFFFF80"
    />
    <Text style={styles.helpText}>
      Press Enter to continue with an empty page, or pick a template (1 to select)
    </Text>
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionButtonText}>New Task</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionButtonText}>Empty</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionButtonText}>New template</Text>
    </TouchableOpacity>
  </View>
);

const TaskList = () => {
  const tasks = {
    todo: ['New page'],
    doing: ['Take Fig on a walk'],
    done: []
  };

  return (
    <View style={styles.taskList}>
      <Text style={styles.taskListTitle}>Task List</Text>
      <Text style={styles.taskListDescription}>
        Use this template to track your personal tasks.<br />
        Click <Text style={styles.highlightText}>New</Text> to create a new task directly on this board.<br />
        Click an existing task to add additional context or <Text style={styles.highlightText}>subtasks</Text>.
      </Text>
      <View style={styles.viewToggle}>
        <TouchableOpacity style={styles.viewToggleButton}>
          <Text style={styles.viewToggleButtonText}>Board View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewToggleButton}>
          <Text style={styles.viewToggleButtonText}>List View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.taskColumns}>
        <TaskColumn title="To Do" tasks={tasks.todo} />
        <TaskColumn title="Doing" tasks={tasks.doing} />
        <TaskColumn title="Done" tasks={tasks.done} />
      </View>
    </View>
  );
};

const TaskPanel = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [showAGiXTModal, setShowAGiXTModal] = useState(false);
  const [chains, setChains ] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agixtApiUri, setAgixtApiUri] = useState("");
  const [agixtApiKey, setAgixtApiKey] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Low'); // Set default to 'Low'
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
  const [darkMode, setDarkMode] = useState(true);
  const [githubData, setGithubData] = useState(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [interactiveUri, setInteractiveUri] = useState("");
  const [automationMode, setAutomationMode] = useState(true); // Keep this as false for off by default

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
        const parsedTasks: Task[] = JSON.parse (storedTasks);
        // Ensure loaded tasks have the 'group' property
        const tasksWithGroup = parsedTasks.map(task => ({ ...task, group: task.group || 'Default' }));
        setTasks(tasksWithGroup);
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
      showAlert("Error", "Failed to get chains from AGiXT. Please check your configuration.");
    }
  };

  const getAgents = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    if (!agixtApiUri || !agixtApiKey) {
      console.error("AGiXT API URI or API Key is missing");
      showAlert("Configuration Error", "AGiXT API URI or API Key is not set. Please check your settings.");
      return;
    }

    try {
      console.log(`Attempting to fetch agents (Attempt ${retryCount + 1}/${maxRetries + 1})`);

      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });

      console.log("AGiXT SDK initialized. Fetching agents...");
      const agentList = await agixt.getAgents();
      console.log("Agents fetched successfully:", agentList);

      let formattedAgents: { name: string }[] = [];
      if (Array.isArray(agentList)) {
        formattedAgents = agentList.map(agent => ({ name: typeof agent === 'string' ? agent : agent.name }));
      } else if (typeof agentList === 'object' && agentList !== null) {
        formattedAgents = Object.keys(agentList).map(name => ({ name }));
      } else {
        throw new Error("Unexpected agent list format");
      }

      console.log("Formatted agents:", formattedAgents);
      setAgents(formattedAgents);

      if (formattedAgents.length > 0 && !selectedAgent) {
        console.log("Setting selected agent to:", formattedAgents[0].name);
        setSelectedAgent(formattedAgents[0].name);
      } else if (formattedAgents.length === 0) {
        console.warn("No agents found");
        showAlert("No Agents", "No agents were found. You may need to create an agent first.");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);

      if (error instanceof Error && error.message.includes("401")) {
        showAlert("Authentication Error", "Invalid API key. Please check your API key and try again.");
        return; // Don't retry on authentication errors
      }

      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        setTimeout(() => getAgents(retryCount + 1), retryDelay);
      } else {
        showAlert("Error", "Failed to fetch agents after multiple attempts. Please try again later.");
        setAgents([]);
      }
    }
  };

  // Function to validate and update AGiXT configuration
  const updateAGiXTConfig = async (newApiUri?: string, newApiKey?: string) => {
    let updatedUri = newApiUri || agixtApiUri;
    let updatedKey = newApiKey || agixtApiKey;

    if (!updatedUri || !updatedKey) {
      showAlert("Configuration Error", "Both AGiXT API URI and API Key must be provided.");
      return false;
    }

    try {
      // Remove trailing slash from URI if present
      updatedUri = updatedUri.replace(/\/$/, '');

      // Test the configuration
      const testAgixt = new AGiXTSDK({
        baseUri: updatedUri,
        apiKey: updatedKey,
      });

      await testAgixt.getAgents(); // This will throw an error if the configuration is invalid

      // If successful, update the stored values
      await AsyncStorage.setItem(AGIXT_API_URI_KEY, updatedUri);
      await AsyncStorage.setItem(AGIXT_API_KEY_KEY, updatedKey);

      setAgixtApiUri(updatedUri);
      setAgixtApiKey(updatedKey);

      console.log("AGiXT configuration updated successfully");
      showAlert("Success", "AGiXT configuration updated successfully.");

      // Refresh the agents list with the new configuration
      await getAgents();

      return true;
    } catch (error) {
      console.error("Error updating AGiXT configuration:", error);
      showAlert("Configuration Error", "Failed to validate the new configuration. Please check your API URI and Key.");
      return false;
    }
  };

  // Use this function in your component's useEffect or wherever you need to load the initial configuration
  const loadAGiXTConfig = async () => {
    try {
      const storedUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
      const storedKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);

      if (storedUri && storedKey) {
        setAgixtApiUri(storedUri);
        setAgixtApiKey(storedKey);
        await getAgents(); // Fetch agents with the loaded configuration
      } else {
        showAlert("Configuration Missing", "AGiXT API URI or API Key is not set. Please configure them in settings.");
      }
    } catch (error) {
      console.error("Error loading AGiXT configuration:", error);
      showAlert("Error", "Failed to load AGiXT configuration. Please check your settings.");
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
      showAlert("Error", "Failed to fetch GitHub repositories. Please check your configuration.");
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
        const incomplete Dependencies = taskToRemove.dependencies.filter(depId => 
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

  const updateAGiXTApiKey = async (newApiKey: string) => {
    try {
      await AsyncStorage.setItem(AGIXT_API_KEY_KEY, newApiKey);
      setAgixtApiKey(newApiKey);
      // Optionally, you can refresh the agents list here
      await getAgents();
    } catch (error) {
      console.error('Error updating AGiXT API key:', error);
      showAlert("Error", "Failed to update AGiXT API key. Please try again.");
    }
  };

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
    if (!selectedAgent) {
      showAlert("No Agent Selected", "Please select an agent before generating subtasks.");
      setShowAGiXTModal(true);
      return;
    }

    if (selectedTaskForAGiXT) {
      setShowSubtaskClarificationModal(false);
      setIsLoading(true);
      try {
        const agixt = new AGiXTSDK({
          baseUri: agixtApiUri,
          apiKey: agixtApiKey,
        });

        const userInput = `Generate subtasks for the following task:
  Task Name: ${selectedTaskForAGiXT.text}
  Description: ${selectedTaskForAGiXT.note || 'No description provided'}
  Due Date: ${selectedTaskForAGiXT.dueDate || 'Not set'}
  Priority: ${selectedTaskForAGiXT.priority || 'Not set'}
  Additional Context: ${subtaskClarificationText}

  Please provide a list of 3-5 subtasks for this main task. Each subtask should be specific, measurable, and contribute to the completion of the main task. Format the response as a JSON array of objects, where each object has 'id', 'text', and 'completed' properties.`;

        console.log("Calling chat with:", selectedAgent, userInput);

        const result = await agixt.chat(
          selectedAgent,
          userInput,
          `Subtasks_${selectedTaskForAGiXT.id}`,
          4 // contextResults, adjust as needed
        );

        console.log("Result from chat:", result);

        const subtasks = parseSubtasks(result);

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
        setIs Loading(false);
      }
    } else {
      console.error("No task selected");
      showAlert("Error", "No task selected. Please select a task and try again.");
    }
  }, [selectedTaskForAGiXT, selectedAgent, subtaskClarificationText, tasks, saveTasks, agixtApiUri, agixtApiKey, showAlert, setShowAGiXTModal]);

  const parseSubtasks = (result: string): Task[] => {
    try {
      // Find the start and end of the JSON array within the response
      const startIndex = result.indexOf('```\n[') + 4; // +4 to skip "```\n["
      const endIndex = result.lastIndexOf(']\n```');

      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find JSON array in the response');
      }

      // Extract the JSON string
      const jsonString = result.substring(startIndex, endIndex + 1);

      // Parse the JSON string
      const parsedResult = JSON.parse(jsonString);

      if (!Array.isArray(parsedResult)) {
        throw new Error('Parsed result is not an array');
      }

      return parsedResult.map(subtask => ({
        id: Date.now() + Math.random(), // Generate a unique id
        text: subtask.text,
        completed: false,
        group: 'Default',
        subtasks: []
      }));
    } catch (error) {
      console.error('Error parsing subtasks:', error);
      showAlert("Error", "Failed to parse subtasks. Please check the agent's response format.");
      return [];
    }
  };

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
          const priorityOrder: { [key: string]: number } = { High: 0, Medium: 1, Low: 2, undefined: 3 };
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

  const renderTaskItem = ({ item }: { item: Task }) => {
    if (automationMode) {
      return (
        <TaskCard
          key={item.id}
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
          darkMode={darkMode}
        />
      );
    } else {
      // Render task item from the first code, adapted to use the darkMode state
      return (
        <View style={[styles.taskItem, darkMode && styles.darkModeTaskItem]}>
          <View style={styles.taskHeader}>
            <TouchableOpacity onPress={() => onToggleComplete(item.id)}>
              <MaterialIcons
                name={item.completed ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={item.completed ? "#4CAF50" : (darkMode ? "#FFFFFF" : "#000000")}
              />
            </TouchableOpacity>
            <Text style={[styles.taskText, darkMode && styles.darkModeText]}>
              {item.text}
            </Text>
            <View style={styles.taskActions}>
              <TouchableOpacity onPress={() => editTask(item)}>
                <MaterialIcons
                  name="edit"
                  size={24}
                  color={darkMode ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeTask(item.id)}>
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
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </Text>
            )}
            <Text
              style={[
                styles.taskPriority,
                darkMode && styles.darkModeText,
                getPriorityStyle(item.priority || 'Low'), // Provide a default priority
              ]}
            >
              {item.priority || 'Low'} {/* Display default priority if not set */}
            </Text>
            <Text
              style={[
                styles.taskStatus,
                darkMode && styles.darkModeText,
                getStatusStyle(item.status || 'Pending'), // Provide a default status
              ]}
            >
              {item.status || 'Pending'} {/* Display default status if not set */}
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
                setShowAGiXTModal(true); 
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
    }
  };

  const renderSubtaskItem = ({ item }: { item: Task }) => (
    <View
      style={[styles.subtaskItem, darkMode && styles.darkModeSubtaskItem]}
    >
      <View style={styles.taskHeader}>
        <Text style={[styles.subtaskText, darkMode && styles.darkModeText]}>
          {item.text}
        </Text>
        <View style={styles.taskActions}>
          <TouchableOpacity onPress={() => editTask(item)}>
            <MaterialIcons
              name="edit"
              size={20}
              color={darkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeTask(item.id)}>
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
            getPriorityStyle(item.priority || 'Low'), // Provide a default priority
          ]}
        >
          {item.priority || 'Low'} {/* Display default priority if not set */}
        </Text>
        <Text
          style={[
            styles.taskStatus,
            darkMode && styles.darkModeText,
            getStatusStyle(item.status || 'Pending'), // Provide a default status
          ]}
        >
          {item.status || 'Pending'} {/* Display default status if not set */}
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

      const userInput = GENERATE_SUBTASKS_PROMPT
        .replace('{taskName}', task.text)
        .replace('{taskDescription}', task.description || '')
        .replace('{dueDate}', task.dueDate || '')
        .replace('{priority}', task.priority || '')
        .replace('{additionalContext}', '');

      const result = await agixt.chat(
        selectedAgent,
        userInput,
        conversationName,
        4
      );

      const subtasks = parseSubtasksFromFirstCode(result);
      const updatedTask = {
        ...task,
        subtasks: subtasks,
        status: 'Pending' as const,
      };
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      saveTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));

      updateConversationLog(updatedTask, 'Agent', result);
    } catch (error) {
      console.error('Error generating subtasks:', error);
      showAlert('Error', 'Failed to generate subtasks.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseSubtasksFromFirstCode = (result: string): Task[] => {
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
        priority: subtask.priority || 'Low', 
        status: 'Pending',
        subtasks: [],
        conversationLog: [],
        completed: false,
        group: 'Default', 
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
    if (!selectedAgent) {
      showAlert('Agent Required', 'Please select an agent.');
      return;
    }

    try {
      setIsLoading(true);
      const agixt = new AGiXTSDK({
        baseUri: agixtApiUri,
        apiKey: agixtApiKey,
      });

      const conversationName = task.conversationId || `Chain_${task.id}`;
      if (!task.conversationId) {
        await agixt.newConversation(selectedAgent, conversationName);
        task.conversationId = conversationName;
      }

      const result = await agixt.runChain(
        'Task Management', // Default chain name, replace with your actual chain name
        task.text, 
        selectedAgent,
        false,
        1,
        {
          conversation_name: conversationName,
        }
      );

      const updatedTask = { ...task, status: 'Running' as const };
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      saveTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));

      updateConversationLog(updatedTask, 'Agent', result);
    } catch (error) {
      console.error('Error running chain:', error);
      showAlert('Error', 'Failed to run chain.');
      const updatedTask = { ...task, status: 'Failed' as const };
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      saveTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
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
      conversationLog: [...(task.conversationLog || []), { role, message }],
    };
    setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    saveTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
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

        <View style={styles.modeToggleContainer}>
          <Text style={[styles.modeToggleLabel, darkMode && styles.darkModeText]}>Automation Mode:</Text>
          <Switch
            value={automationMode} // Bind to the state
            onValueChange={(newValue) => setAutomationMode(newValue)} // Update state on toggle
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={automationMode ? "#f5dd4b" : "#f4f3f4"}
          />
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
                {automationMode || <Text style={[styles.groupTitle, darkMode && styles.darkModeText]}>{groupName}</Text>}
                {groupTasks.map(task => renderTaskItem({ item: task }))}
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
          onAgentSelect={(agent, chain, input) => {
            handleAgentSelect(agent, chain, input);
            if (selectedTaskForAGiXT) {
              handleRunChain(selectedTaskForAGiXT);
            }
          }}
          chains={chains}
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          darkMode={darkMode}
          showAlert={showAlert} 
          getAgents={getAgents}
          getChains={getChains}
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
  // Container Styles
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

  // Header Styles
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

  // Integration Bar Styles
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

  // Mode Toggle Styles
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeToggleLabel: {
    marginRight: 10,
    fontSize: 16,
    color: '#000000',
  },

  // Selected Group Title Styles
  selectedGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },

  // Filter Styles
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

  // Input Container Styles
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

  // Task Group Styles
  taskGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },

  // Task Item Styles (from the first code)
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
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 80,
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

  // Modal Styles
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

  // Floating Action Button Styles
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Picker Styles
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',  
    borderRadius: 5,
   marginBottom: 10,
    backgroundColor: '#FFFFFF', // Add this line
  },
  darkModePickerContainer: {
    borderColor: '#555',
    backgroundColor: '#333333', // Addthis line
  },
  picker: {
    height: 40,
    color: '#000000',
    width: '100%', // Add this line
   },
   darkModePicker: {
    color: '#FFFFFF',
  },
  pickerItem: {
    color: darkMode ? '#FFFFFF' : '#000000', // Update this line}
  },
   darkModePickerItem: {
    color: '#FFFFFF',
   },

  // Date Picker Styles
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

  // Task Card Styles
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  darkModeTaskCard: {
    backgroundColor: '#2B2B2B',
  },
  taskCheckbox: {
    marginRight: 10,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999999',
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
  actionButton: {
    padding: 5,
  },

  // Link Styles
  link: {
    color: '#3498DB',
    textDecorationLine : 'underline',
  },

  // Sidebar Styles
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

  // GitHub Integration Styles
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

  // Error Text Styles
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },

  // Chat Sidebar Styles
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

  // Loading Overlay Styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Alert Modal Styles
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
    fontSize: 20 ,
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

  // Unsupported Platform Styles
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

  // Loading Container Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Edit Task Modal Styles
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

  // AGiXT Modal Styles
  chainInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  noAgentsText: {
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  disabledButton: {
    opacity: 0.5,
  },

  // AGiXTOptionsModal Styles
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

  // SubtaskClarificationModal Styles
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

  // Conversation Log Styles
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
  taskDetails: {
    padding: 20,
  },
  taskDetailsInfoText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskDetailsInfoLabel: {
    fontSize : 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  taskDetailsInfoValue: {
    fontSize: 16,
  },
  addPropertyButton: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addPropertyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  commentInput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default TaskPanel;