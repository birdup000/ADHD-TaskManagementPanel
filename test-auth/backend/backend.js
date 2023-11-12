const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// Load users from JSON file
let users = JSON.parse(fs.readFileSync('users.json'));

// Register endpoint for new users
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate user input
  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Check if user already exists
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Hash password for secure storage
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in JSON store
  users.push({ username, password: hashedPassword });

  // Update users JSON file
  fs.writeFileSync('users.json', JSON.stringify(users));

  // Generate JWT
  const token = jwt.sign({ userId: username }, 'my-secret-key', { expiresIn: '1h' });

  res.status(201).json({ message: 'User registered successfully', token });
});

// Login endpoint for existing users
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate user input
  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Check if user exists in JSON store
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Compare password hashes
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  // Generate JWT
  const token = jwt.sign({ userId: username }, 'my-secret-key', { expiresIn: '1h' });

  res.status(200).json({ message: 'User logged in successfully', token });
});

// Protected route example
app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];

  // Verify JWT
  try {
    const decoded = jwt.verify(token, 'my-secret-key');
    const username = decoded.userId;

    res.status(200).json({ message: `Welcome, ${username}` });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Start Express server
app.listen(5000, () => console.log('Server started on port 5000'));
