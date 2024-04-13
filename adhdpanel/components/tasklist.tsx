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
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ApolloClient, InMemoryCache, gql, useMutation, useQuery } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { Picker } from '@react-native-picker/picker';

if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}

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
  const [subtaskText, setSubtaskText] = useState("");
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [editedSubtaskText, setEditedSubtaskText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");


  useEffect(() => {
    const getGithubUsernameAndAuthKey = async () => {
      try {
        const storedGithubUsername = await AsyncStorage.getItem('githubUsername');
        const storedAuthKey = await AsyncStorage.getItem('authKey');

        if (storedGithubUsername && storedAuthKey) {
          setGithubUsername(storedGithubUsername);
          setAuthKey(storedAuthKey);
          loadTasks();
        } else {
          console.log('GitHub username and/or API key not available');
        }
      } catch (error) {
        console.log('Error getting GitHub username and/or API key from AsyncStorage:', error);
      }
    };

    getGithubUsernameAndAuthKey();
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

  const saveTasks = async (updatedTasks: any[]) => {
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
        subtasks: [],
      };
      setTasks([...tasks, newTask]);
      saveTasks([...tasks, newTask]);
      setTaskText("");
      setPriority("");
      setSelectedRepo("");
      setSubtaskText("");
    }
  };
  

  const addSubtask = (taskId, subtaskText) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtask = { id: Date.now(), text: subtaskText };
        return {
          ...task,
          subtasks: task.subtasks ? [...task.subtasks, newSubtask] : [newSubtask],
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setSubtaskText("");
  };
  

const removeSubtask = (tasks, subtaskId) => {
  return tasks.map((task) => {
    if (task.id === subtaskId) {
      return null; // Remove the subtask
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: removeSubtask(task.subtasks, subtaskId),
      };
    }
    return task;
  }).filter(Boolean); // Remove any null values (removed subtasks)
};


  const editSubtask = (taskId, subtaskId, subtaskText) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            return { ...subtask, text: subtaskText };
          }
          return subtask;
        });
        return { ...task, subtasks: updatedSubtasks };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setSelectedSubtask(updatedTasks.find((task) => task.id === taskId).subtasks.find((subtask) => subtask.id === subtaskId));
    setEditedSubtaskText(subtaskText);
  };
  
  
  const handleSubtaskSelect = (subtask) => {
    setSelectedSubtask(subtask);
  };

  const handleSubtaskRemove = (subtaskId) => {
    const updatedTasks = removeSubtask(tasks, subtaskId);
    setTasks(updatedTasks);
  };



  const SubtaskTree = ({ task, selectedSubtask, onSubtaskSelect, onSubtaskRemove, onSubtaskAdd }) => {
    if (!task) return null;
  
    const handleSubtaskRemove = (subtaskId) => {
      onSubtaskRemove(subtaskId);
    };
  
    const handleSubtaskAdd = (subtaskText) => {
      onSubtaskAdd(task.id, subtaskText);
    };
  
    return (
      <View style={styles.subtaskTreeContainer}>
        <View style={styles.subtaskTreeItem}>
          <TouchableOpacity
            style={[
              styles.subtaskText,
              selectedSubtask?.id === task.id ? styles.selectedSubtask : null,
            ]}
            onPress={() => onSubtaskSelect(task)}
          >
            <Text>{task.text}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeSubtaskButton}
            onPress={() => handleSubtaskRemove(task.id)}
          >
            <Icon name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.subtaskTreeChildren}>
            {task.subtasks.map((subtask) => (
              <SubtaskTree
                key={subtask.id}
                task={subtask}
                selectedSubtask={selectedSubtask}
                onSubtaskSelect={onSubtaskSelect}
                onSubtaskRemove={handleSubtaskRemove}
                onSubtaskAdd={handleSubtaskAdd}
              />
            ))}
          </View>
        )}
        {task.id === tasks[tasks.length - 1].id && (
          <TextInput
            style={styles.input}
            value={newSubtaskText}
            onChangeText={setNewSubtaskText}
            placeholder="Add a new subtask"
            placeholderTextColor="#FFFFFF80"
            onSubmitEditing={() => handleSubtaskAdd(newSubtaskText)}
          />
        )}
      </View>
    );
  };
  
  
  

  

  

  const handleTaskNameChange = (text: string) => {
    setTaskName(text);
  };

  const ExampleCustomInput = React.forwardRef<HTMLDivElement, { value: string | null; onClick: () => void }>((props, ref) => (
    <TouchableOpacity style={styles.input} onPress={props.onClick} ref={ref}>
      <Text style={{ color: "white" }}>
        {props.value ? props.value : "No Due Date Set"}
      </Text>
    </TouchableOpacity>
  ));

  const removeTask = (id: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (task: any) => {
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
      if (task.id === selectedTask?.id) {
        return {
          ...task,
          text: taskName,
          note: noteText,
          dueDate: dueDate ? dueDate.toISOString() : null,
          priority: priority,
          repo: selectedRepo,
          subtasks: task.subtasks.map((subtask) => {
            if (subtask.id === selectedSubtask?.id) {
              return { ...subtask, text: editedSubtaskText };
            }
            return subtask;
          }),
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setShowEditModal(false);
    setSelectedTask(null);
    setSelectedSubtask(null);
    setEditedSubtaskText("");
  };
  
  
  
  

  return (
    <View style={styles.container}>
      {!githubUsername || !data ? (
        <View style={styles.repoPickerContainer}>
          <Text style={styles.repoPickerLabel}>GitHub username and API key not available. Please set them by accessing Home and top right settings icon to be able to use the integration.</Text>
        </View>
      ) : (
        <View style={styles.repoPickerContainer}>
          <Text style={styles.repoPickerLabel}>Select a Repository:</Text>
          <Picker
            style={styles.repoPicker}
            selectedValue={selectedRepo}
            onValueChange={(value) => setSelectedRepo(value)}
          >
            <Picker.Item label="Select a repository" value={null} />
            {data.user.repositories.nodes.map((repo: any) => (
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
              <SubtaskTree
              task={item}
              selectedSubtask={selectedSubtask}
              onSubtaskSelect={handleSubtaskSelect}
              onSubtaskRemove={handleSubtaskRemove}
              onSubtaskAdd={addSubtask}
            />
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
      <View>
        <Text style={{ color: "white" }}>Subtasks:</Text>
        <FlatList
  data={selectedTask?.subtasks || []}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.subtaskContainer}>
      <TextInput
        style={[
          styles.subtaskText,
          { color: '#FFFFFF' }, // Set the color to white
          item.id === selectedSubtask?.id
            ? styles.selectedSubtask
            : null,
        ]}
        value={item.id === selectedSubtask?.id ? editedSubtaskText : item.text}
        onChangeText={
          item.id === selectedSubtask?.id
            ? setEditedSubtaskText
            : (text) => {
                setNewSubtaskText(text);
                setSelectedSubtask(item);
              }
        }
        placeholder={item.text}
        placeholderTextColor="#FFFFFF80"
        onSubmitEditing={() =>
          item.id === selectedSubtask?.id
            ? editSubtask(selectedTask.id, selectedSubtask.id, editedSubtaskText)
            : addSubtask(selectedTask.id, newSubtaskText)
        }
      />
      {item.id === selectedSubtask?.id && (
        <TouchableOpacity
          style={styles.saveSubtaskButton}
          onPress={() =>
            editSubtask(selectedTask.id, selectedSubtask.id, editedSubtaskText)
          }
        >
          <Icon name="check" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  )}
/>
        <TextInput
          style={styles.input}
          value={newSubtaskText}
          onChangeText={setNewSubtaskText}
          placeholder="Add a new subtask"
          placeholderTextColor="#FFFFFF80"
          onSubmitEditing={() => addSubtask(selectedTask.id, newSubtaskText)}
        />
      </View>
      <View>
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
        <TouchableOpacity
          style={styles.removeDueDateButton}
          onPress={removeDueDate}
        >
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
          {data &&
            data.user &&
            data.user.repositories.nodes.map((repo: any) => (
              <Picker.Item key={repo.name} label={repo.name} value={repo.name} />
            ))}
        </Picker>
        <TouchableOpacity style={styles.modalButton} onPress={saveTaskEdit}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#121212",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#FFFFFF80",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    marginRight: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: (task) => {
      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        return "#FF3B30"; // Red for past due tasks
      } else {
        return "transparent";
      }
    },
  },
  taskText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  noteText: {
    marginTop: 8,
    fontSize: 16,
    fontStyle: "italic",
    color: "#FFFFFF80",
  },
  dueDateText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF80",
  },
  priorityText: {
    marginTop: 8,
    fontSize: 16,
    color: "#FFFFFF80",
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
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
    padding: 24,
    borderRadius: 16,
    width: "90%",
    height: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  taskInfoContainer: {
    flex: 1,
    color: "#FFFFFF",
    backgroundColor: (task) => {
      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        return "#FF3B3020"; // Red background for past due tasks
      } else {
        return "#1E1E1E";
      }
    },
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: "25%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 24,
  },
  removeDueDateButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: "25%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 24,
  },
  repoContainer: {
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  repoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  repoDescription: {
    fontSize: 16,
    color: "#FFFFFF80",
    marginBottom: 12,
  },
  repoUrl: {
    fontSize: 16,
    color: "#007AFF",
  },
  repoPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    color: "#FFFFFF",
  },
  repoPickerLabel: {
    color: "#FFFFFF",
    marginRight: 16,
  },
  repoPicker: {
    flex: 1,
    color: "black",
  },
  repoText: {
    marginTop: 8,
    fontSize: 16,
    color: "#FFFFFF80",
  },
  subtaskTreeContainer: {
    marginTop: 16,
    color: "#FFFFFF",
  },
  subtaskTreeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subtaskTreeChildren: {
    marginLeft: 24,
  },
  subtaskText: {
    color: "white",
    fontSize: 16,
  },
  addSubtaskButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
});