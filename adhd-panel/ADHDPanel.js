import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Timer from "./components/Timer";
import Reports from "./components/Reports";
import Calender from "./components/Calender.tsx";
import "./ADHDPanel.css";

const ADHDPanel = () => {
  return (
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
          </ul>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/calendar" element={<Calender />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default ADHDPanel;