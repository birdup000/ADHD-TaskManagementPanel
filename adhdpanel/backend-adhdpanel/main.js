const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000", // Replace with the correct URL of your frontend app
  methods: ["GET", "POST"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers including Authorization for JWT tokens
}));
app.use(bodyParser.json());


// Define verifyToken middleware function first before using it.
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token && req.path !== "/api/signup") { // Exclude /api/signup from token verification
    console.log('No token provided');
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Invalid token');
    res.status(401).send("Invalid token");
  }
}

app.use(verifyToken);


const taskListFilePath = path.join(__dirname, "taskList.json");
const userFilePath = path.join(__dirname, "users.json");

let taskList = [];
let users = [];

const createUser = (username, password) => {
  const newUser = { username, password };
  users.push(newUser);
  saveUsersToFile();
};

const secretKey = '3544578934973475437857349';

///const { secretKey } = require("./config");

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
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
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

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (authenticateUser(username, password)) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    res.status(409).send("User already exists");
  } else {
    createUser(username, password); // Create a new user
    res.sendStatus(201);
  }
});


app.post("/api/logout", (req, res) => {
  // No need for implementation as JWT tokens are stateless and can be invalidated on client side.
  res.sendStatus(200);
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
