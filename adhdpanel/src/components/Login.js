import React, { useState } from "react";
import axios from "axios";
import LoginCSS from "./logincss.css";

const LoginForm = ({ onSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggleForm = () => {
    setShowLogin(!showLogin);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:5000/api/login", { username, password });
      if (response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    }
  };
  

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/signup", { username, password });
      if (response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      if (error.response.status === 409) {
        setErrorMessage("Username already exists");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div>
      <h1>{showLogin ? "Login" : "Signup"}</h1>
      <form onSubmit={showLogin ? handleLogin : handleSignup}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {!showLogin && (
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        <button type="submit">{showLogin ? "Login" : "Signup"}</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
      <button onClick={handleToggleForm}>
        {showLogin ? "Switch to Signup" : "Switch to Login"}
      </button>
    </div>
  );
};

export default LoginForm;
