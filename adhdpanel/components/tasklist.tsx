import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the styles
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ApolloClient, InMemoryCache, gql, useMutation, useQuery} from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

import { Picker } from '@react-native-picker/picker';


if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

// Define the GraphQL query to fetch user repositories
const GET_USER_REPOSITORIES = gql`
  query getRepositories($username: String!) {
    user(login: $username) {
      repositories(first: 10) {
        nodes {
          name
          description
          url
        }
      }
    }
  }
`;




export default function TaskPanel() {
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("");
  const [taskName, setTaskName] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  useEffect(() => {
    const getGithubUsername = async () => {
      try {
        const storedGithubUsername = await AsyncStorage.getItem('githubUsername');
        if (storedGithubUsername) {
          setGithubUsername(storedGithubUsername);
        }
      } catch (error) {
        console.log("Error getting GitHub username from AsyncStorage:", error);
      }
    };
    getGithubUsername();
    loadTasks();
  }, []);

  const { loading, error, data } = useQuery(GET_USER_REPOSITORIES, {
    variables: { username: githubUsername },
  });

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

  const saveTasks = async (updatedTasks: any[]) => { // Declare type for updatedTasks parameter
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.log("Error saving tasks:", error);
    }
  };

  const addTask = () => {
    if (taskText.trim().length > 0) {
      const newTask = {
        id: Date.now(),
        text: taskText.trim(),
        note: "",
        dueDate: null,
        priority: priority,
        repo: selectedRepo,
      };
      setTasks([...tasks, newTask]);
      saveTasks([...tasks, newTask]);
      setTaskText("");
      setPriority("");
      setSelectedRepo(null);
    }
  };

  const handleTaskNameChange = (text: string) => { // Declare type for text parameter
    setTaskName(text);
  };

  const ExampleCustomInput = React.forwardRef<HTMLDivElement, { value: string | null; onClick: () => void }>(({ value, onClick }, ref) => ( // Declare types for value and onClick properties
    <TouchableOpacity style={styles.input} onPress={onClick} ref={ref}>
      <Text style={{ color: "white" }}>
        {value ? value : "No Due Date Set"}
      </Text>
    </TouchableOpacity>
  ));

  const removeTask = (id: number) => { // Declare type for id parameter
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (task: any) => { // Declare type for task parameter
    setSelectedTask(task);
    setNoteText(task.note || "");
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setPriority(task.priority || "");
    setShowEditModal(true);
    setTaskName(task.text);
    setSelectedRepo(task.repo);
  };


  const removeDueDate = () => {
    setDueDate(null);
  };

  const saveTaskEdit = () => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          text: taskName,
          note: noteText,
          dueDate: dueDate ? dueDate.toISOString() : null,
          priority: priority,
          repo: selectedRepo,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setShowEditModal(false);
    setSelectedTask(null); // Reset the selectedTask state
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error.message}</Text>
      ) : (
        <View style={styles.repoPickerContainer}>
          <Text style={styles.repoPickerLabel}>Select a Repository:</Text>
          <Picker
            style={styles.repoPicker}
            selectedValue={selectedRepo}
            onValueChange={(value) => setSelectedRepo(value)}
          >
            <Picker.Item label="Select a repository" value={null} />
            {data && data.user && data.user.repositories.nodes.map((repo: any) => (
              <Picker.Item key={repo.name} label={repo.name} value={repo.name} />
            ))}
          </Picker>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={taskText}
          onChangeText={setTaskText}
          placeholder="Enter a task"
          placeholderTextColor="#FFFFFF80"
        />
        <TextInput
          style={styles.input}
          value={priority}
          onChangeText={setPriority}
          placeholder="Priority (e.g., High, Medium, Low)"
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
          <TouchableOpacity
            style={[
              styles.taskContainer,
              {
                borderColor:
                  item.dueDate && new Date(item.dueDate) < new Date()
                    ? "#FF3B30"
                    : "transparent",
                backgroundColor:
                  selectedTask && selectedTask.id === item.id
                    ? "#2E2E2E"
                    : "#1E1E1E",
              },
            ]}
            onPress={() => editTask(item)}
          >
            <View style={styles.taskInfoContainer}>
              <Text
                style={[
                  styles.taskText,
                  {
                    fontWeight:
                      item.dueDate && new Date(item.dueDate) < new Date()
                        ? "bold"
                        : "normal",
                  },
                ]}
              >
                {item.text}
              </Text>
              {item.note && <Text style={styles.noteText}>Note: {item.note}</Text>}
              {item.dueDate && (
                <Text style={styles.dueDateText}>
                  Due Date: {new Date(item.dueDate).toLocaleString()}
                </Text>
              )}
              {item.priority && (
                <Text style={styles.priorityText}>Priority: {item.priority}</Text>
              )}
              {item.repo && (
                <Text style={styles.repoText}>Repository: {item.repo}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeTask(item.id)}
            >
              <Icon name="delete" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
                <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEditModal(false)}
              >
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: "white" }}>Task Name:</Text>
            <TextInput
              style={styles.input}
              value={taskName}
              onChangeText={handleTaskNameChange}
              placeholder="Enter a task"
              placeholderTextColor="#FFFFFF80"
            />
            <Text style={{ color: "white" }}>Note:</Text>
            <TextInput
              style={styles.input}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter a note"
              placeholderTextColor="#FFFFFF80"
            />
            <Text style={{ color: "white" }}>Due Date:</Text>
            <DatePicker
              selected={dueDate}
              onChange={(date: Date) => setDueDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="No Due Date Set"
              customInput={<ExampleCustomInput />}
            />
            <TouchableOpacity style={styles.removeDueDateButton} onPress={removeDueDate}>
              <Text style={styles.buttonText}>Remove Due Date</Text>
            </TouchableOpacity>
            <Text style={{ color: "white" }}>Priority:</Text>
            <TextInput
              style={styles.input}
              value={priority}
              onChangeText={setPriority}
              placeholder="Priority (e.g., High, Medium, Low)"
              placeholderTextColor="#FFFFFF80"
            />
            <Text style={{ color: "white" }}>Repository:</Text>
            <Picker
              style={styles.repoPicker}
              selectedValue={selectedRepo}
              onValueChange={(value) => setSelectedRepo(value)}
            >
              <Picker.Item label="Select a repository" value={null} />
              {data && data.user && data.user.repositories.nodes.map((repo: any) => (
                <Picker.Item key={repo.name} label={repo.name} value={repo.name} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.modalButton} onPress={saveTaskEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#FFFFFF80",
    borderRadius: 4,
    paddingHorizontal: 8,
    color: "#FFFFFF",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 4,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#1E1E1E",
    padding: 8,
    borderRadius: 4,
    // Add the following styles
    borderWidth: 2,
    borderColor: (task) => {
      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        return "#FF3B30"; // Red for past due tasks
      } else {
        return "transparent"; // No border for tasks with no due date or not past due
      }
    },
  },
  taskText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "normal",
    padding: 8,
  },
  noteText: {
    marginTop: 4,
    fontSize: 14,
    fontStyle: "italic",
    color: "#FFFFFF80",
  },
  dueDateText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF80",
  },
  priorityText: {
    marginTop: 4,
    fontSize: 14,
    color: "#FFFFFF80",
    padding: 8,
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 8,
    width: "90%",
    height: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  taskInfoContainer: {
    flex: 1,
    // Add the following styles
    backgroundColor: (task) => {
      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        return "#FF3B3020"; // Red background for past due tasks
      } else {
        return "#1E1E1E"; // Default background
      }
    },
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 4,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    width: "25%",
    marginLeft: "auto",
    marginRight: "auto",
    padding: 8,
    marginTop: 16,
  },
  removeDueDateButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    width: "25%",
    marginLeft: "auto",
    marginRight: "auto",
    padding: 8,
    marginTop: 16,
  },
  repoContainer: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  repoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  repoDescription: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginBottom: 8,
  },
  repoUrl: {
    fontSize: 14,
    color: '#007AFF',
  },
  repoPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  repoPickerLabel: {
    color: '#FFFFFF',
    marginRight: 8,
  },
  repoPicker: {
    flex: 1,
    color: 'black',
  },
  repoText: {
    marginTop: 4,
    fontSize: 14,
    color: "#FFFFFF80",
  },
});