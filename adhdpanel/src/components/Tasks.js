import React, { useState, useEffect, useRef } from "react";
import TaskManagementPanelCSS from "./TaskManagementPanel.css";

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

  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tasks");

        if (response.ok) {
          const taskList = await response.json();
          setTaskList(taskList);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTaskList();
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

  const handleAddTask = async () => {
    if (task.trim() !== "") {
      const newTask = { task, status, dueDate, notes, priority, category, reminders };

      try {
        const response = await fetch("http://localhost:5000/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          setTaskList([...taskList, newTask]);
          resetForm();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteTask = async (index) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${index}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedTaskList = [...taskList];
        updatedTaskList.splice(index, 1);
        setTaskList(updatedTaskList);
        setSelectedTaskIndex(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRenameTask = async (index, newTask) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${index}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...taskList[index], task: newTask }),
      });

      if (response.ok) {
        const updatedTaskList = [...taskList];
        updatedTaskList[index].task = newTask;
        setTaskList(updatedTaskList);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetTaskStatus = async (index, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${index}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...taskList[index], status: newStatus }),
      });

      if (response.ok) {
        const updatedTaskList = [...taskList];
        updatedTaskList[index].status = newStatus;
        setTaskList(updatedTaskList);
      }
    } catch (error) {
      console.error(error);
    }
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

  const handleClearTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "DELETE",
      });

      if (response.ok) {
        setTaskList([]);
        setSelectedTaskIndex(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteAllTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/complete-all", {
        method: "PUT",
      });

      if (response.ok) {
        const updatedTaskList = taskList.map((taskItem) =>
          taskItem.status === TaskStatus.COMPLETED ? taskItem : { ...taskItem, status: TaskStatus.COMPLETED }
        );
        setTaskList(updatedTaskList);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompletePendingTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/complete-pending", {
        method: "PUT",
      });

      if (response.ok) {
        const updatedTaskList = taskList.map((taskItem) =>
          taskItem.status === TaskStatus.PENDING
            ? { ...taskItem, status: TaskStatus.COMPLETED }
            : taskItem
        );
        setTaskList(updatedTaskList);
      }
    } catch (error) {
      console.error(error);
    }
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
    <div className="task-management-panel">
      <h2 className="heading">Task Management Panel</h2>
      <div className="add-task">
        <input
          type="text"
          value={task}
          onChange={handleTaskChange}
          placeholder="Enter task"
          ref={taskInputRef}
          className="task-input"
        />
        <select
          value={priority}
          onChange={handlePriorityChange}
          className="select-priority"
        >
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.LOW}>Low</option>
        </select>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="select-category"
        >
          <option value={TaskCategories.WORK}>Work</option>
          <option value={TaskCategories.PERSONAL}>Personal</option>
          <option value={TaskCategories.SHOPPING}>Shopping</option>
        </select>
        <button onClick={handleAddTask} className="add-button">
          Add Task
        </button>
      </div>
      {taskList.length === 0 ? (
        <p className="no-tasks">No tasks found. Add a task to get started!</p>
      ) : (
        <div>
          <div className="sort-filter">
            <label className="sort-label">Sort Order:</label>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="select-sort"
            >
              <option value="default">Default</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
            <label className="filter-label">Filter Status:</label>
            <select
              value={filterStatus}
              onChange={handleFilterStatusChange}
              className="select-filter"
            >
              <option value="all">All</option>
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.OVERDUE}>Overdue</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>
          <ul className="task-list">
            {getSortedFilteredTaskList().map((taskItem, index) => (
              <li
                key={index}
                className={
                  selectedTaskIndex === index ? "task-item selected" : "task-item"
                }
                style={{
                  borderColor: TaskStatusColors[taskItem.status],
                  color: TaskStatusColors[taskItem.status],
                }}
              >
                <div className="task-details">
                  <input
                    type="checkbox"
                    checked={selectedTaskIndex === index}
                    onChange={() => handleSelectTask(index)}
                    className="task-checkbox"
                  />
                  <input
                    type="text"
                    value={taskItem.task}
                    onChange={(event) => handleRenameTask(index, event.target.value)}
                    className="task-name"
                  />
                </div>
                <div className="task-actions">
                  <button
                    onClick={() =>
                      handleSetTaskStatus(
                        index,
                        taskItem.status === TaskStatus.PENDING
                          ? TaskStatus.OVERDUE
                          : TaskStatus.PENDING
                      )
                    }
                    className="status-button"
                  >
                    {taskItem.status === TaskStatus.PENDING
                      ? "Set Overdue"
                      : "Set Pending"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(index)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {selectedTaskIndex >= 0 && (
            <div className="task-details-container">
              <h3 className="task-details-heading">Task Details</h3>
              <div className="due-date-container">
                <label className="due-date-label">Due Date:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  className="due-date-input"
                />
              </div>
              <div className="notes-container">
                <label className="notes-label">Notes:</label>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  className="notes-input"
                />
              </div>
              <div className="priority-container">
                <label className="priority-label">Priority:</label>
                <select
                  value={priority}
                  onChange={handlePriorityChange}
                  className="select-priority"
                >
                  <option value={TaskPriority.HIGH}>High</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.LOW}>Low</option>
                </select>
              </div>
              <div className="category-container">
                <label className="category-label">Category:</label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="select-category"
                >
                  <option value={TaskCategories.WORK}>Work</option>
                  <option value={TaskCategories.PERSONAL}>Personal</option>
                  <option value={TaskCategories.SHOPPING}>Shopping</option>
                </select>
              </div>
              <div className="reminders-container">
                <label className="reminders-label">Reminders:</label>
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="reminder-item">
                    <input
                      type="date"
                      value={reminder.date}
                      onChange={(event) =>
                        handleReminderDateChange(event, reminder.id)
                      }
                      className="reminder-date"
                    />
                    <input
                      type="time"
                      value={reminder.time}
                      onChange={(event) =>
                        handleReminderTimeChange(event, reminder.id)
                      }
                      className="reminder-time"
                    />
                    <button
                      onClick={() => handleRemoveReminder(reminder.id)}
                      className="remove-reminder-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddReminder}
                  className="add-reminder-button"
                >
                  Add Reminder
                </button>
              </div>
            </div>
          )}
          <div className="action-buttons-container">
            <button
              onClick={handleCompletePendingTasks}
              className="complete-pending-button"
              disabled={
                taskList.filter((taskItem) => taskItem.status === TaskStatus.PENDING)
                  .length === 0
              }
            >
              Complete All Pending
            </button>
            <button
              onClick={handleCompleteAllTasks}
              className="complete-all-button"
              disabled={
                taskList.filter(
                  (taskItem) => taskItem.status !== TaskStatus.COMPLETED
                ).length === 0
              }
            >
              Complete All
            </button>
            <button
              onClick={handleClearTasks}
              className="clear-tasks-button"
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
