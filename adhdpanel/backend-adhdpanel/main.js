const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let taskList = [];

app.get("/api/tasks", (req, res) => {
  res.json(taskList);
});

app.post("/api/tasks", (req, res) => {
  const newTask = req.body;
  taskList.push(newTask);
  res.sendStatus(201);
});

app.put("/api/tasks/:index", (req, res) => {
  const index = req.params.index;
  const updatedTask = req.body;
  taskList[index] = updatedTask;
  res.sendStatus(200);
});

app.delete("/api/tasks/:index", (req, res) => {
  const index = req.params.index;
  taskList.splice(index, 1);
  res.sendStatus(200);
});

app.put("/api/tasks/complete-all", (req, res) => {
  taskList = taskList.map((taskItem) =>
    taskItem.status === TaskStatus.COMPLETED
      ? taskItem
      : { ...taskItem, status: TaskStatus.COMPLETED }
  );
  res.sendStatus(200);
});

app.put("/api/tasks/complete-pending", (req, res) => {
  taskList = taskList.map((taskItem) =>
    taskItem.status === TaskStatus.PENDING
      ? { ...taskItem, status: TaskStatus.COMPLETED }
      : taskItem
  );
  res.sendStatus(200);
});

app.delete("/api/tasks", (req, res) => {
  taskList = [];
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});