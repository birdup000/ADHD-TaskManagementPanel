import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import "react-datepicker/dist/react-datepicker.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Graph from "react-graph-vis";

const Three = () => {
  const graph = {
    nodes: [
      { id: 1, label: "Manage subtasks", color: "#e04141" },
      { id: 2, label: "Integrate JSON/YAML parser", color: "#e09c41" },
      { id: 3, label: "Integrate AGiXT", color: "#e0df41" }
  ],
  edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3 }
  ]
  };


  const options = {
    edges: {
      color: "lightblue"
    },
    height: "1000px",
    width: "100%",
  };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
    }
  };

  return (
      <Graph
        graph={graph}
        options={options}
        events={events}
      />

  );
}


export default Three;