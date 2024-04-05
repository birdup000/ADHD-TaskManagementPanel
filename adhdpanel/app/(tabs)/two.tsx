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

export default function TaskPanel() {
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("");
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

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
      };
      setTasks([...tasks, newTask]);
      saveTasks([...tasks, newTask]);
      setTaskText("");
      setPriority("");
    }
  };

const handleTaskNameChange = (text) => {
  setTaskName(text); // Update task name state
};

  const removeTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (task) => {
    setSelectedTask(task);
    setNoteText(task.note || "");
    setDueDate(task.dueDate ? new Date(task.dueDate) : new Date());
    setPriority(task.priority || "");
    setShowEditModal(true);
    setTaskName(task.text);
  };


const saveTaskEdit = () => {
  const updatedTasks = tasks.map((task) => {
    if (task.id === selectedTask.id) {
      return {
        ...task,
        text: taskName, // Update task name
        note: noteText,
        dueDate: dueDate ? dueDate.toISOString() : null,
        priority: priority,
      };
    }
    return task;
  });
  setTasks(updatedTasks);
  saveTasks(updatedTasks);
  setShowEditModal(false);
};

  return (
    <View style={styles.container}>
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
            style={styles.taskContainer}
            onPress={() => editTask(item)}
          >
            <Text style={styles.taskText}>{item.text}</Text>
            {item.note && (
              <Text style={styles.noteText}>Note: {item.note}</Text>
            )}
            {item.dueDate && (
              <Text style={styles.dueDateText}>
                Due Date: {new Date(item.dueDate).toLocaleString()}
              </Text>
            )}
            {item.priority && (
              <Text style={styles.priorityText}>Priority: {item.priority}</Text>
            )}
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
            />
            <Text style={{ color: "white" }}>Priority:</Text>
            <TextInput
              style={styles.input}
              value={priority}
              onChangeText={setPriority}
              placeholder="Priority (e.g., High, Medium, Low)"
              placeholderTextColor="#FFFFFF80"
            />
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
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  noteText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: "italic",
    color: "#FFFFFF80",
  },
  dueDateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF80",
  },
  priorityText: {
    marginLeft: 8,
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
    width: "40%",
    marginLeft: "auto",
    marginRight: "auto",
    padding: 8,
    marginTop: 16,
  },
});
