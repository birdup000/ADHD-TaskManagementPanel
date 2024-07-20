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
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AGiXTSDK from "agixt";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

const ProgressBar = ({ progress, color }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const Sidebar = ({ groups, tasks, onGroupSelect, onClose, darkMode }) => {
  const calculateGroupProgress = (groupName) => {
    const groupTasks = tasks.filter(task => task.group === groupName);
    const completedTasks = groupTasks.filter(task => task.completed);
    return (completedTasks.length / groupTasks.length) * 100 || 0;
  };

  const totalProgress = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed);
    return (completedTasks.length / tasks.length) * 100 || 0;
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

const TaskCard = ({ task, onEdit, onRemove, onAGiXTOptions, onToggleComplete, showDependencies, allTasks, darkMode }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const cardStyle = {
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
    opacity: animatedValue,
  };

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
    <Animated.View style={[styles.taskCard, cardStyle, darkMode && styles.darkModeTaskCard]}>
      <TouchableOpacity onPress={() => onToggleComplete(task.id)} style={styles.taskCheckbox}>
        <MaterialIcons 
          name={task.completed ? "check-circle" : "radio-button-unchecked"} 
          size={24} 
          color={task.completed ? "#4CAF50" : (darkMode ? "#FFFFFF" : "#000000")}
        />
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <Text style={[styles.taskText, task.completed && styles.completedTaskText, darkMode && styles.darkModeText]}>
          {task.text}
        </Text>
        {task.note && (
          <Text style={[styles.noteText, darkMode && styles.darkModeText]}>
            {renderTextWithLinks(task.note)}
          </Text>
        )}
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

const FloatingActionButton = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <MaterialIcons name="add" size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

const CustomSwitch = ({ value, onValueChange }) => (
  <TouchableOpacity
    style={[
      styles.switchContainer,
      { backgroundColor: value ? '#4CAF50' : '#7f8c8d' }
    ]}
    onPress={() => onValueChange(!value)}
  >
    <Animated.View
      style={[
        styles.switchThumb,
        {
          transform: [
            {
              translateX: value ? 22 : 2,
            },
          ],
        },
      ]}
    />
  </TouchableOpacity>
);

const CustomPicker = ({ selectedValue, onValueChange, items, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.pickerButton, darkMode && styles.darkModePickerButton]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.pickerButtonText, darkMode && styles.darkModeText]}>
          {selectedValue || "Select an option"}
        </Text>
        <MaterialIcons
          name={isOpen ? "arrow-drop-up" : "arrow-drop-down"}
          size={24}
          color={darkMode ? "#FFFFFF" : "#000000"}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.pickerOptions, darkMode && styles.darkModePickerOptions]}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={styles.pickerOption}
              onPress={() => {
                onValueChange(item.value);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  item.value === selectedValue && styles.pickerOptionSelected,
                  darkMode && styles.darkModeText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const EnhancedDatePicker = ({ selected, onChange, darkMode }) => {
  const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <TouchableOpacity onPress={onClick} ref={ref} style={[styles.datePickerButton, darkMode && styles.darkModeDatePickerButton]}>
      <Text style={[styles.datePickerButtonText, darkMode && styles.darkModeText]}>
        {value || "Select due date"}
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
  const [groupBy, setGroupBy] = useState("none");
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [sortBy, setSortBy] = useState("dueDate");
  const [taskGroups, setTaskGroups] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    groupTasks();
  }, [tasks, groupBy, showCompletedTasks, sortBy]);

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
        group: "Default",
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

  const groupTasks = useCallback(() => {
    let filteredTasks = showCompletedTasks ? tasks : tasks.filter(task => !task.completed);

    // Sort tasks
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    // Group tasks
    const groups = {};
    filteredTasks.forEach(task => {
      let groupKey;
      switch (groupBy) {
        case 'priority':
          groupKey = task.priority || 'No Priority';
          break;
        case 'dueDate':
          groupKey = task.dueDate ? new Date(task.dueDate).toDateString() : 'No Due Date';
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

  const onMoveTask = useCallback((movedTask, yPosition) => {
    const updatedTasks = [...tasks];
    const movedTaskIndex = updatedTasks.findIndex(t => t.id === movedTask.id);
    const targetIndex = Math.floor(yPosition / 100); // Assuming each task is about 100 pixels high

    if (targetIndex !== movedTaskIndex) {
      updatedTasks.splice(movedTaskIndex, 1);
      updatedTasks.splice(targetIndex, 0, movedTask);
      saveTasks(updatedTasks);
    }
  }, [tasks, saveTasks]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowSidebar(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.darkMode]}>
      <LinearGradient
        colors={darkMode ? ['#1A2980', '#26D0CE'] : ['#4CA1AF', '#C4E0E5']}
        style={styles.container}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={28} color={darkMode ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text style={[styles.title, darkMode && styles.darkModeText]}>Task Manager</Text>
          <CustomSwitch
            value={darkMode}
            onValueChange={toggleDarkMode}
          />
        </View>

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
            <CustomSwitch
              value={showCompletedTasks}
              onValueChange={setShowCompletedTasks}
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
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

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

        {isLoading && <LoadingOverlay darkMode={darkMode} />}
      </LinearGradient>
    </SafeAreaView>
  );
}

const EditTaskModal = ({ visible, task, onClose, onSave, repositories, allTasks, darkMode }) => {
  const [editedTask, setEditedTask] = useState(null);
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (task) {
      setEditedTask({...task});
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    } else {
      setEditedTask({
        id: Date.now(),
        text: '',
        note: '',
        priority: '',
        repo: '',
        subtasks: [],
        dependencies: [],
        recurrence: null,
        completed: false,
        group: 'Default',
      });
      setDueDate(null);
    }
  }, [task]);

  const handleChange = (field, value) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, darkMode && styles.darkModeOverlay]}>
        <View style={[styles.modalContent, darkMode && styles.darkModeModalContent]}>
          <Text style={[styles.modalTitle, darkMode && styles.darkModeText]}>
            {task ? "Edit Task" : "Add New Task"}
          </Text>
          <ScrollView style={styles.modalBody}>
            <InputField
              label="Task Name"
              value={editedTask?.text}
              onChangeText={(text) => handleChange('text', text)}
              darkMode={darkMode}
            />
            
            <InputField
              label="Description"
              value={editedTask?.note}
              onChangeText={(text) => handleChange('note', text)}
              multiline
              darkMode={darkMode}
            />
            
            <View style={styles.datePickerContainer}>
              <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Due Date</Text>
              <EnhancedDatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                darkMode={darkMode}
              />
            </View>
            
            <CustomPicker
              label="Priority"
              selectedValue={editedTask?.priority}
              onValueChange={(value) => handleChange('priority', value)}
              items={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
              darkMode={darkMode}
            />
            
            <CustomPicker
              label="Repository"
              selectedValue={editedTask?.repo}
              onValueChange={(value) => handleChange('repo', value)}
              items={repositories.map(repo => ({ label: repo.name, value: repo.name }))}
              darkMode={darkMode}
            />

            <CustomPicker
              label="Recurrence"
              selectedValue={editedTask?.recurrence}
              onValueChange={(value) => handleChange('recurrence', value)}
              items={[
                { label: 'None', value: null },
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ]}
              darkMode={darkMode}
            />

            <InputField
              label="Group"
              value={editedTask?.group}
              onChangeText={(text) => handleChange('group', text)}
              darkMode={darkMode}
            />
            
            <SubtasksList
              subtasks={editedTask?.subtasks}
              onSubtasksChange={(subtasks) => handleChange('subtasks', subtasks)}
              darkMode={darkMode}
            />

            <DependencyList
              allTasks={allTasks}
              currentTaskId={editedTask?.id}
              dependencies={editedTask?.dependencies}
              onToggleDependency={toggleDependency}
              darkMode={darkMode}
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

const InputField = ({ label, value, onChangeText, multiline = false, darkMode }) => (
  <View style={styles.inputField}>
    <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput, darkMode && styles.darkModeInput]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
    />
  </View>
);

const SubtasksList = ({ subtasks, onSubtasksChange, darkMode }) => {
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
      <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Subtasks</Text>
      {subtasks.map((subtask) => (
        <View key={subtask.id} style={styles.subtaskItem}>
          <TextInput
            style={[styles.subtaskInput, darkMode && styles.darkModeInput]}
            value={subtask.text}
            onChangeText={(text) => updateSubtask(subtask.id, text)}
            placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
          />
          <TouchableOpacity onPress={() => removeSubtask(subtask.id)}>
            <MaterialIcons name="remove-circle-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
        <MaterialIcons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={[styles.addSubtaskText, darkMode && styles.darkModeText]}>Add Subtask</Text>
      </TouchableOpacity>
    </View>
  );
};

const DependencyList = ({ allTasks, currentTaskId, dependencies, onToggleDependency, darkMode }) => {
  return (
    <View style={styles.dependencyList}>
      <Text style={[styles.inputLabel, darkMode && styles.darkModeText]}>Dependencies</Text>
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
            <Text style={[styles.dependencyItemText, darkMode && styles.darkModeText]}>{task.text}</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  );
};

const AGiXTModal = ({ visible, onClose, onAgentSelect, chains, agents, selectedAgent, setSelectedAgent, darkMode }) => {
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
            items={chains.map(chain => ({ label: chain, value: chain }))}
            darkMode={darkMode}
          />
          <TextInput
            style={[styles.chainInput, darkMode && styles.darkModeInput]}
            value={chainInput}
            onChangeText={setChainInput}
            placeholder="Enter chain input"
            placeholderTextColor={darkMode ? "#FFFFFF80" : "#00000080"}
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

const AGiXTOptionsModal = ({ visible, onClose, onOptionSelect, darkMode }) => {
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

const SubtaskClarificationModal = ({ visible, onClose, onContinue, clarificationText, onChangeClarificationText, isLoading, darkMode }) => {
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

const AlertModal = ({ visible, title, message, onClose, darkMode }) => {
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

const LoadingOverlay = ({ darkMode }) => (
  <View style={[styles.loadingOverlay, darkMode && styles.darkModeOverlay]}>
    <ActivityIndicator size="large" color={darkMode ? "#FFFFFF" : "#000000"} />
  </View>
);

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
  },
  darkModeInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#3498DB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  darkModeModalContent: {
    backgroundColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
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
  buttonOk: {
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
  switchContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  darkModePickerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerButtonText: {
    color: '#000000',
  },
  pickerOptions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    marginTop: 5,
  },
  darkModePickerOptions: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerOption: {
    padding: 10,
  },
  pickerOptionText: {
    color: '#000000',
  },
  pickerOptionSelected: {
    fontWeight: 'bold',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  darkModeDatePickerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  datePickerButtonText: {
    color: '#000000',
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeTaskCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
  },
  noteText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 5,
  },
  dueDateText: {
    color: '#666666',
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
    color: '#000000',
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
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
  },
  darkModeSidebar: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
  inputField: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#000000',
    marginBottom: 5,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
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
    color: '#000000',
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
    color: '#000000',
  },
  chainInput: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#000000',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionText: {
    color: '#000000',
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
  clarificationInput: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#000000',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: 'top',
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  integrationButtonActive: {
    backgroundColor: '#3498DB',
  },
  noAgentsText: {
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
});

export default TaskPanel;