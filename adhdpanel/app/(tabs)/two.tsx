import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TaskPanel() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  };

  const addTask = () => {
    if (taskText.trim().length > 0) {
      const newTask = { id: Date.now(), text: taskText.trim() };
      setTasks([...tasks, newTask]);
      saveTasks([...tasks, newTask]);
      setTaskText('');
    }
  };

  const removeTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (task) => {
    setSelectedTask(task);
    setNoteText(task.note || '');
    setDueDate(task.dueDate || '');
    setShowEditOverlay(true);
  };

  const saveTaskEdit = () => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === selectedTask.id) {
        return { ...task, note: noteText, dueDate };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setShowEditOverlay(false);
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
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskContainer} onPress={() => editTask(item)}>
            <Text style={styles.taskText}>{item.text}</Text>
            {item.note && <Text style={styles.noteText}>Note: {item.note}</Text>}
            {item.dueDate && <Text style={styles.dueDateText}>Due Date: {item.dueDate}</Text>}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeTask(item.id)}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      {showEditOverlay && (
        <View style={styles.overlayContainer}>
          <View style={styles.editContainer}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.input}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter a note"
              placeholderTextColor="#FFFFFF80"
            />
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="Enter due date (MM/DD/YYYY)"
              placeholderTextColor="#FFFFFF80"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={saveTaskEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowEditOverlay(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#FFFFFF80',
    borderRadius: 4,
    paddingHorizontal: 8,
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 4,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  noteText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FFFFFF80',
  },
  dueDateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF80',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editContainer: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
});