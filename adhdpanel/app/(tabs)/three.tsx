import React, { useState, useEffect } from "react";
import Graph from "react-graph-vis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from '@expo/vector-icons';

const IS_LOCKED_KEY = "isLocked";

const TaskMap = () => {
  const [tasks, setTasks] = useState([]);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks !== null) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.log("Error loading tasks:", error);
      }
    };

    const getIsLocked = async () => {
      try {
        const storedIsLocked = await AsyncStorage.getItem(IS_LOCKED_KEY);
        if (storedIsLocked !== null) {
          setIsLocked(JSON.parse(storedIsLocked));
        }
      } catch (e) {
        console.error('Error accessing AsyncStorage:', e);
      }
    };

    loadTasks();
    getIsLocked();
  }, []);

  const graph = {
    nodes: tasks.flatMap((task) => [
      {
        id: task.id,
        label: task.text,
        color: "#e04141",
        icon: {
          face: 'FontAwesome5',
          code: isLocked ? '\uf023' : '\uf09c', // Lock icon if locked, unlock icon if unlocked
          size: 25,
          color: '#ffffff',
        },
      },
      ...task.subtasks?.map((subtask) => ({
        id: subtask.id,
        label: subtask.text,
        color: "#7be141",
        icon: {
          face: 'FontAwesome5',
          code: isLocked ? '\uf023' : '\uf09c', // Lock icon if locked, unlock icon if unlocked
          size: 25,
          color: '#ffffff',
        },
      })),
    ]),
    edges: tasks.flatMap((task, index) => [
      ...task.subtasks?.map((subtask) => ({
        from: task.id,
        to: subtask.id,
        color: "lightblue",
      })),
      ...task.subtasks?.map((subtask) => ({
        from: subtask.id,
        to: task.id,
        color: "lightblue",
      })),
    ]),
  };

  const options = {
    edges: {
      color: "lightblue",
    },
    height: "1000px",
    width: "100%",
    physics: {
      enabled: isLocked, // Disable physics if locked, enable if unlocked
      solver: "repulsion",
      repulsion: {
        nodeDistance: 120,
      },
    },
  };

  const events = {
    select: function (event) {
      var { nodes, edges } = event;
    },
  };

  return (
    <div style={{ position: 'relative' }}>
      <Graph
        graph={graph}
        options={options}
        events={events}
      />
    </div>
  );
};

export default TaskMap;