import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import Svg, { Circle, Line, Text, G, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const IS_LOCKED_KEY = "isLocked";
const TASKS_KEY = "tasks";

const TaskMap = () => {
  const [tasks, setTasks] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_KEY);
      if (storedTasks !== null) {
        const parsedTasks = JSON.parse(storedTasks);
        if (JSON.stringify(parsedTasks) !== JSON.stringify(tasks)) {
          setTasks(parsedTasks);
        }
      }
    } catch (error) {
      console.log("Error loading tasks:", error);
    }
  }, [tasks]);

  const toggleLock = useCallback(async () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    try {
      await AsyncStorage.setItem(IS_LOCKED_KEY, JSON.stringify(newLockState));
    } catch (error) {
      console.log("Error saving lock state:", error);
    }
  }, [isLocked]);

  useEffect(() => {
    loadTasks();
    const intervalId = setInterval(loadTasks, 10000);
    return () => clearInterval(intervalId);
  }, [loadTasks]);

  useEffect(() => {
    const getInitialLockState = async () => {
      try {
        const storedIsLocked = await AsyncStorage.getItem(IS_LOCKED_KEY);
        if (storedIsLocked !== null) {
          setIsLocked(JSON.parse(storedIsLocked));
        }
      } catch (e) {
        console.error('Error accessing AsyncStorage:', e);
      }
    };
    getInitialLockState();
  }, []);

  const handleZoom = useCallback((event) => {
    if (!isLocked) {
      const { nativeEvent } = event;
      const newZoom = nativeEvent.scale > 1 ? zoom * 1.05 : zoom * 0.95;
      setZoom(Math.max(0.1, Math.min(newZoom, 5)));
    }
  }, [zoom, isLocked]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => !isLocked,
    onPanResponderMove: (evt, gestureState) => {
      if (!isLocked) {
        setPan(prevPan => ({
          x: prevPan.x + gestureState.dx / zoom,
          y: prevPan.y + gestureState.dy / zoom
        }));
      }
    },
    onPanResponderGrant: () => {},
    onPanResponderRelease: () => {},
  });

  const handleZoomIn = () => setZoom(prevZoom => Math.min(prevZoom * 1.2, 5));
  const handleZoomOut = () => setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.1));
  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const getFontSize = (radius) => Math.max(14, Math.min(18, radius / 2));

  const wrapText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    const words = text.split(' ');
    let line = '';
    const lines = [];
    words.forEach(word => {
      if ((line + word).length > maxLength) {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    });
    lines.push(line.trim());
    return lines.join('\n');
  };

  const renderText = (x, y, text, fontSize, isSubtask = false) => (
    <G>
      <Text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
        alignmentBaseline="central"
        opacity={0.8}
      >
        {text}
      </Text>
      <Text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {text}
      </Text>
    </G>
  );

  const renderGraph = () => {
    const nodeRadius = 35;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;

    return (
      <G>
        {tasks.map((task, index) => {
          const angle = (index / tasks.length) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <G key={task.id}>
              {task.subtasks?.map((subtask, subIndex) => {
                const subAngle = angle + ((subIndex + 1) / (task.subtasks.length + 1) - 0.5) * Math.PI / 2;
                const subRadius = radius * 0.7;
                const subX = x + subRadius * Math.cos(subAngle);
                const subY = y + subRadius * Math.sin(subAngle);

                return (
                  <G key={`${task.id}-${subIndex}`}>
                    <Line
                      x1={x}
                      y1={y}
                      x2={subX}
                      y2={subY}
                      stroke="#4A5568"
                      strokeWidth="3"
                    />
                    <Circle
                      cx={subX}
                      cy={subY}
                      r={nodeRadius * 0.7}
                      fill="#2D3748"
                    />
                    {renderText(subX, subY, wrapText(subtask.text, 12), getFontSize(nodeRadius * 0.7), true)}
                  </G>
                );
              })}
              <Circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill="#1A202C"
              />
              {renderText(x, y, wrapText(task.text, 14), getFontSize(nodeRadius))}
            </G>
          );
        })}
      </G>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#111111']}
        style={StyleSheet.absoluteFillObject}
      />
      <View 
        style={styles.graphContainer} 
        {...panResponder.panHandlers}
        onGestureEvent={handleZoom}
      >
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor="#1A202C" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" />
          <G transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {renderGraph()}
          </G>
        </Svg>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleZoomIn}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleZoomOut}>
          <Ionicons name="remove" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleLock}>
          <Ionicons name={isLocked ? "lock-closed" : "lock-open"} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  graphContainer: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  button: {
    backgroundColor: '#2D3748',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TaskMap;