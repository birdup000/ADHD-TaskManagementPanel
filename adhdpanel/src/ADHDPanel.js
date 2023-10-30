import React, { useState } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { Navigate, BrowserRouter as Router, Link, Routes } from 'react-router-dom';
import Home from './components/Home';
import Tasks from './components/Tasks';
import Timer from './components/Timer';
import Reports from './components/Reports';
import Calender from './components/Calender.tsx';
import LoginForm from './components/Login';
import './ADHDPanel.css';

const AuthContext = React.createContext({
  jwtToken: '',
});

const AuthProvider = ({ children }) => {
  const [jwtToken, setJwtToken] = useState('');

  const login = async (username, password) => {
    const response = await axios.post('/api/login', {
      username,
      password,
    });

    if (response.status === 200) {
      setJwtToken(response.headers['authorization']);
    }
  };

  const value = {
    jwtToken,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const PrivateRoute = ({ children }) => {
  const { jwtToken } = useContext(AuthContext);

  if (!jwtToken) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const ADHDPanel = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="adhd-panel">
          <div className="side-menu">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/tasks">Tasks</Link>
              </li>
              <li>
                <Link to="/timer">Timer</Link>
              </li>
              <li>
                <Link to="/reports">Reports</Link>
              </li>
              <li>
                <Link to="/calendar">Calender</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </div>
          <div className="content">
            <Routes>
              <Routes path="/" element={<Home />} />
              <Routes path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
              <Routes path="/timer" element={<PrivateRoute><Timer /></PrivateRoute>} />
              <Routes path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Routes path="/calendar" element={<PrivateRoute><Calender /></PrivateRoute>} />
              <Routes path="/login" element={<LoginForm />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default ADHDPanel;
