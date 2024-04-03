import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TaskPanel() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    setDueDate(task.dueDate ? new Date(task.dueDate) : new Date());
    setShowEditModal(true);
  };

  const saveTaskEdit = () => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === selectedTask.id) {
        return { ...task, note: noteText, dueDate: dueDate.toISOString().split('T')[0] };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setShowEditModal(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const showDateTimePicker = () => {
    setShowDatePicker(true);
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
          <Icon name="add" size={24} color="#FFFFFF" />
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
            <TextInput
              style={styles.input}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter a note"
              placeholderTextColor="#FFFFFF80"
            />
            <TouchableOpacity style={styles.datePickerButton} onPress={showDateTimePicker}>
              <Text style={styles.buttonText}>Select Due Date</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <View style={styles.modalButtonContainer}>
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
    padding: 8,
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
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 4,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  datePickerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  });