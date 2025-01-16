import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { agixtApi } from "../utils/agixtApi";

interface Task {
  id: string;
  title: string;
  // Add other properties as needed
}

export default function TaskPanel() {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = document.cookie.replace(/(?:(?:^|,*\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
      const data = await agixtApi("api/agent/AGiXT/tasks", "GET", null, token || null);
      setTasks(data);
    };
    if (user) {
      fetchTasks();
    }
  }, [user]);

  return (
    <div>
      <h1>Task Panel</h1>
      <button onClick={logout}>Logout</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}