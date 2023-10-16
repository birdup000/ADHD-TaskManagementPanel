import React, { useState, useEffect, useRef } from "react";

const TaskStatus = {
  PENDING: "pending",
  OVERDUE: "overdue",
  COMPLETED: "completed",
};

const TaskStatusColors = {
  [TaskStatus.PENDING]: "#FFC900",
  [TaskStatus.OVERDUE]: "#FF5733",
  [TaskStatus.COMPLETED]: "#3EA055",
};

const TaskPriority = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const TaskCategories = {
  WORK: "work",
  PERSONAL: "personal",
  SHOPPING: "shopping",
};

const TaskManagementPanel = () => {
  const [task, setTask] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [status, setStatus] = useState(TaskStatus.PENDING);
  const [sortOrder, setSortOrder] = useState("default");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(-1);
  const [priority, setPriority] = useState(TaskPriority.MEDIUM);
  const [category, setCategory] = useState(TaskCategories.WORK);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const inputRef = taskInputRef.current;
    if (inputRef) {
      inputRef.focus();
    }
  }, []);

  const taskInputRef = useRef(null);

  const handleTaskChange = (event) => {
    setTask(event.target.value);
  };

  const handleDueDateChange = (event) => {
    setDueDate(event.target.value);
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleAddTask = () => {
    if (task.trim() !== "") {
      const newTask = { task, status, dueDate, notes, priority, category, reminders };
      setTaskList([...taskList, newTask]);
      resetForm();
    }
  };

  const handleDeleteTask = (index) => {
    const updatedTaskList = [...taskList];
    updatedTaskList.splice(index, 1);
    setTaskList(updatedTaskList);
    setSelectedTaskIndex(-1);
  };

  const handleRenameTask = (index, newTask) => {
    const updatedTaskList = [...taskList];
    updatedTaskList[index].task = newTask;
    setTaskList(updatedTaskList);
  };

  const handleSetTaskStatus = (index, newStatus) => {
    const updatedTaskList = [...taskList];
    updatedTaskList[index].status = newStatus;
    setTaskList(updatedTaskList);
  };

  const handleSelectTask = (index) => {
    setSelectedTaskIndex(index);
    const { task, status, dueDate, notes, priority, category, reminders } = taskList[index];
    setTask(task);
    setStatus(status);
    setDueDate(dueDate);
    setNotes(notes);
    setPriority(priority);
    setCategory(category);
    setReminders(reminders);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleAddReminder = () => {
    setReminders([...reminders, { date: "", time: "", id: Date.now() }]);
  };

  const handleRemoveReminder = (id) => {
    const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
    setReminders(updatedReminders);
  };

  const handleReminderDateChange = (event, id) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === id ? { ...reminder, date: event.target.value } : reminder
    );
    setReminders(updatedReminders);
  };

  const handleReminderTimeChange = (event, id) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === id ? { ...reminder, time: event.target.value } : reminder
    );
    setReminders(updatedReminders);
  };

  const getSortedFilteredTaskList = () => {
    const sortedTaskList = [...taskList];
    switch (sortOrder) {
      case "default":
        sortedTaskList.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "pending":
        sortedTaskList.sort((a, b) => a.task.localeCompare(b.task));
        sortedTaskList.sort((a, b) => {
          if (a.status !== TaskStatus.PENDING && b.status === TaskStatus.PENDING) {
            return -1;
          } else if (a.status === TaskStatus.PENDING && b.status !== TaskStatus.PENDING) {
            return 1;
          }
          return 0;
        });
        break;
      case "overdue":
        sortedTaskList.sort((a, b) => a.task.localeCompare(b.task));
        sortedTaskList.sort((a, b) => {
          if (a.status === TaskStatus.PENDING && b.status !== TaskStatus.PENDING) {
            return -1;
          } else if (a.status !== TaskStatus.PENDING && b.status === TaskStatus.PENDING) {
            return 1;
          }
          return 0;
        });
        break;
      case "completed":
        sortedTaskList.sort((a, b) => a.task.localeCompare(b.task));
        sortedTaskList.sort((a, b) => {
          if (a.status === TaskStatus.COMPLETED && b.status !== TaskStatus.COMPLETED) {
            return -1;
          } else if (a.status !== TaskStatus.COMPLETED && b.status === TaskStatus.COMPLETED) {
            return 1;
          }
          return 0;
        });
        break;
      default:
        sortedTaskList.sort((a, b) => a.task.localeCompare(b.task));
        break;
    }

    if (filterStatus === "all") {
      return sortedTaskList;
    }

    return sortedTaskList.filter((item) => item.status === filterStatus);
  };

  const handleClearTasks = () => {
    setTaskList([]);
    setSelectedTaskIndex(-1);
  };

  const handleCompleteAllTasks = () => {
    const updatedTaskList = taskList.map((taskItem) =>
      taskItem.status === TaskStatus.COMPLETED ? taskItem : { ...taskItem, status: TaskStatus.COMPLETED }
    );
    setTaskList(updatedTaskList);
  };

  const handleCompletePendingTasks = () => {
    const updatedTaskList = taskList.map((taskItem) =>
      taskItem.status === TaskStatus.PENDING ? { ...taskItem, status: TaskStatus.COMPLETED } : taskItem
    );
    setTaskList(updatedTaskList);
  };

  const resetForm = () => {
    setTask("");
    setStatus(TaskStatus.PENDING);
    setDueDate("");
    setNotes("");
    setPriority(TaskPriority.MEDIUM);
    setCategory(TaskCategories.WORK);
    setReminders([]);
  };

  const formatTime = (time) => {
    return time.substr(0, 5);
  };

  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif", 
      textAlign: "center", 
      maxWidth: "600px", 
      margin: "0 auto", 
      backgroundColor: "#f5f5f5", 
      padding: "20px" 
    }}>
      <h2 style={{ color: "#000", marginBottom: "20px" }}>Task Management Panel</h2>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "10px" 
      }}>
        <input
          type="text"
          value={task}
          onChange={handleTaskChange}
          placeholder="Enter task"
          ref={taskInputRef} // Focus on the input field on render
          style={{ 
            marginRight: "10px", 
            padding: "8px", 
            borderRadius: "4px", 
            border: "1px solid #555", 
            flex: 1, 
            outline: "none" 
          }}
        />
        <select
          value={priority}
          onChange={handlePriorityChange}
          style={{
            marginRight: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #555",
            outline: "none"
          }}
        >
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.LOW}>Low</option>
        </select>
        <select
          value={category}
          onChange={handleCategoryChange}
          style={{
            marginRight: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #555",
            outline: "none"
          }}
        >
          <option value={TaskCategories.WORK}>Work</option>
          <option value={TaskCategories.PERSONAL}>Personal</option>
          <option value={TaskCategories.SHOPPING}>Shopping</option>
        </select>
        <button
          onClick={handleAddTask}
          style={{
            backgroundColor: "#3EA055",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          Add Task
        </button>
      </div>
      {taskList.length === 0 ? (
        <p style={{ color: "#888", marginTop: "20px" }}>No tasks found. Add a task to get started!</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "10px", color: "#000" }}>Sort Order:</label>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #555",
                cursor: "pointer",
                outline: "none",
                marginRight: "10px"
              }}
            >
              <option value="default">Default</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
            <label style={{ marginRight: "10px", color: "#000" }}>Filter Status:</label>
            <select
              value={filterStatus}
              onChange={handleFilterStatusChange}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #555",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All</option>
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.OVERDUE}>Overdue</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {getSortedFilteredTaskList().map((taskItem, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  margin: "10px 0",
                  backgroundColor: selectedTaskIndex === index ? "#eaf6ff" : "#fff",
                  padding: "10px",
                  borderRadius: "4px",
                  border: `2px solid ${TaskStatusColors[taskItem.status]}`,
                  color: TaskStatusColors[taskItem.status], // Setting text color to match status color
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedTaskIndex === index}
                    onChange={() => handleSelectTask(index)}
                    style={{ marginRight: "10px" }}
                  />
                  <input
                    type="text"
                    value={taskItem.task}
                    onChange={(event) => handleRenameTask(index, event.target.value)}
                    style={{
                      marginRight: "10px",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "none",
                      flex: 1,
                      outline: "none",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  />
                </div>
                <div>
                  <button
                    onClick={() =>
                      handleSetTaskStatus(
                        index,
                        taskItem.status === TaskStatus.PENDING
                          ? TaskStatus.OVERDUE
                          : TaskStatus.PENDING
                      )
                    }
                    style={{
                      backgroundColor: TaskStatusColors[taskItem.status],
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      marginRight: "6px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {taskItem.status === TaskStatus.PENDING ? "Set Overdue" : "Set Pending"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(index)}
                    style={{
                      backgroundColor: "#DA4147",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {selectedTaskIndex >= 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Task Details</h3>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ marginRight: "10px", color: "#000" }}>Due Date:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ marginRight: "10px", color: "#000" }}>Notes:</label>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                    width: "100%",
                    height: "80px",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginTop: "20px" }}>
                <label style={{ marginRight: "10px", color: "#000" }}>Priority:</label>
                <select
                  value={priority}
                  onChange={handlePriorityChange}
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                    outline: "none",
                  }}
                >
                  <option value={TaskPriority.HIGH}>High</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.LOW}>Low</option>
                </select>
              </div>
              <div style={{ marginTop: "20px" }}>
                <label style={{ marginRight: "10px", color: "#000" }}>Category:</label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                    outline: "none",
                  }}
                >
                  <option value={TaskCategories.WORK}>Work</option>
                  <option value={TaskCategories.PERSONAL}>Personal</option>
                  <option value={TaskCategories.SHOPPING}>Shopping</option>
                </select>
              </div>
              <div style={{ marginTop: "20px" }}>
                <label style={{ marginRight: "10px" }}>Reminders:</label>
                {reminders.map((reminder) => (
                  <div key={reminder.id} style={{ marginTop: "10px" }}>
                    <input
                      type="date"
                      value={reminder.date}
                      onChange={(event) => handleReminderDateChange(event, reminder.id)}
                      style={{
                        marginRight: "10px",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #555",
                        outline: "none",
                      }}
                    />
                    <input
                      type="time"
                      value={reminder.time}
                      onChange={(event) => handleReminderTimeChange(event, reminder.id)}
                      style={{
                        marginRight: "10px",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #555",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => handleRemoveReminder(reminder.id)}
                      style={{
                        backgroundColor: "#DA4147",
                        color: "#fff",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddReminder}
                  style={{
                    backgroundColor: "#3EA055",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginTop: "10px",
                    outline: "none",
                  }}
                >
                  Add Reminder
                </button>
              </div>
            </div>
          )}
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleCompletePendingTasks}
              style={{
                backgroundColor: TaskStatusColors[TaskStatus.COMPLETED],
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
                outline: "none",
              }}
              disabled={taskList.filter((taskItem) => taskItem.status === TaskStatus.PENDING).length === 0}
            >
              Complete All Pending
            </button>
            <button
              onClick={handleCompleteAllTasks}
              style={{
                backgroundColor: TaskStatusColors[TaskStatus.COMPLETED],
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
                outline: "none",
              }}
              disabled={taskList.filter((taskItem) => taskItem.status !== TaskStatus.COMPLETED).length === 0}
            >
              Complete All
            </button>
            <button
              onClick={handleClearTasks}
              style={{
                backgroundColor: "#DA4147",
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                outline: "none",
              }}
              disabled={taskList.length === 0}
            >
              Clear Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementPanel;
