const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const taskListFilePath = path.join(__dirname, "taskList.json");
const userFilePath = path.join(__dirname, "users.json");

let taskList = [];
let users = [];

const saveTaskListToFile = () => {
  fs.writeFileSync(taskListFilePath, JSON.stringify(taskList), (err) => {
    if (err) {
      console.error("Error writing task list to file:", err);
    }
  });
};

const loadTaskListFromFile = () => {
  try {
    const data = fs.readFileSync(taskListFilePath);
    taskList = JSON.parse(data.toString());
  } catch (err) {
    console.error("Error loading task list from file:", err);
  }
};

const saveUsersToFile = () => {
  fs.writeFileSync(userFilePath, JSON.stringify(users), (err) => {
    if (err) {
      console.error("Error writing users to file:", err);
    }
  });
};

const loadUsersFromFile = () => {
  try {
    const data = fs.readFileSync(userFilePath);
    users = JSON.parse(data.toString());
  } catch (err) {
    console.error("Error loading users from file:", err);
  }
};

loadTaskListFromFile();
loadUsersFromFile();

const authenticateUser = (username, password) => {
  const user = users.find((user) => user.username === username && user.password === password);
  return user !== undefined;
};

app.get("/api/tasks", (req, res) => {
  res.json(taskList);
});

app.post("/api/tasks", (req, res) => {
  const newTask = req.body;
  taskList.push(newTask);
  saveTaskListToFile();
  res.sendStatus(201);
});

app.put("/api/tasks/:index", (req, res) => {
  const index = req.params.index;
  const updatedTask = req.body;
  taskList[index] = updatedTask;
  saveTaskListToFile();
  res.sendStatus(200);
});

app.delete("/api/tasks/:index", (req, res) => {
  const index = req.params.index;
  taskList.splice(index, 1);
  saveTaskListToFile();
  res.sendStatus(200);
});

app.put("/api/tasks/complete-all", (req, res) => {
  taskList = taskList.map((taskItem) =>
    taskItem.status === TaskStatus.COMPLETED
    ? taskItem
    : { ...taskItem, status: TaskStatus.COMPLETED }
  );
  saveTaskListToFile();
  res.sendStatus(200);
});

app.put("/api/tasks/complete-pending", (req, res) => {
  taskList = taskList.map((taskItem) =>
    taskItem.status === TaskStatus.PENDING
    ? { ...taskItem, status: TaskStatus.COMPLETED }
    : taskItem
  );
  saveTaskListToFile();
  res.sendStatus(200);
});

app.delete("/api/tasks", (req, res) => {
  taskList = [];
  saveTaskListToFile();
  res.sendStatus(200);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const authenticated = authenticateUser(username, password);
  if (authenticated) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    res.sendStatus(409);
  } else {
    users.push({ username, password });
    saveUsersToFile();
    res.sendStatus(200);
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
