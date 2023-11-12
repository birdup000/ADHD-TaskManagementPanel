const axios = require("axios");

const apiUrl = "http://localhost:5000/api"; // Replace with the correct URL of your backend API

const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${apiUrl}/login`, { username, password });
    return response.data.token;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const signupUser = async (username, password) => {
  const token = await loginUser("admin", "password"); // Login as an existing user
  if (!token) return;

  try {
    const response = await axios.post(
      `${apiUrl}/signup`,
      { username, password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log(response.status); // Should be 201 if signup was successful
  } catch (error) {
    console.error(error.message);
  }
};

// Call the function with desired username and password
signupUser("testuser", "password123");