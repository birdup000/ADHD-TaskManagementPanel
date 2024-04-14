import React, { useState, useEffect } from "react";
import Graph from "react-graph-vis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TaskMap = () => {
  const [tasks, setTasks] = useState([]);

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
    loadTasks();
  }, []);

  const graph = {
    nodes: tasks.map((task) => ({
      id: task.id,
      label: task.text,
      color: "#e04141",
    })),
    edges: tasks.flatMap((task, index) =>
      task.subtasks?.map((subtask) => ({
        from: task.id,
        to: subtask.id,
      }))
    ),
  };

  const options = {
    edges: {
      color: "lightblue",
    },
    height: "1000px",
    width: "100%",
  };

  const events = {
    select: function (event) {
      var { nodes, edges } = event;
    },
  };

  return (
    <Graph
      graph={graph}
      options={options}
      events={events}
    />
  );
};

export default TaskMap;
