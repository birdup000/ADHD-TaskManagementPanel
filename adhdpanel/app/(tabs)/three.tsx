import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text as RNText } from 'react-native';
import Svg, { Circle, Line, Text, G } from 'react-native-svg';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PanResponder } from 'react-native';

const { width, height } = Dimensions.get('window');
const IS_LOCKED_KEY = "isLocked";
const TASKS_KEY = "tasks";

const TaskMap = () => {
  const [tasks, setTasks] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef(null);

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

  const getIsLocked = useCallback(async () => {
    try {
      const storedIsLocked = await AsyncStorage.getItem(IS_LOCKED_KEY);
      if (storedIsLocked !== null) {
        setIsLocked(JSON.parse(storedIsLocked));
      }
    } catch (e) {
      console.error('Error accessing AsyncStorage:', e);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    getIsLocked();

    const intervalId = setInterval(() => {
      loadTasks();
      getIsLocked();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [loadTasks, getIsLocked]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isLocked,
    onPanResponderMove: (event, gestureState) => {
      setPan(prevPan => ({
        x: prevPan.x + gestureState.dx,
        y: prevPan.y + gestureState.dy
      }));
    },
    onPanResponderGrant: () => {
      svgRef.current.setNativeProps({ style: { cursor: 'grabbing' } });
    },
    onPanResponderRelease: () => {
      svgRef.current.setNativeProps({ style: { cursor: 'grab' } });
    },
  });

  const handleZoom = useCallback((event) => {
    if (!isLocked) {
      const newZoom = event.nativeEvent.deltaY > 0 ? zoom * 0.95 : zoom * 1.05;
      setZoom(Math.max(0.1, Math.min(newZoom, 5)));
    }
  }, [zoom, isLocked]);

  const handleZoomIn = () => setZoom(prevZoom => Math.min(prevZoom * 1.2, 5));
  const handleZoomOut = () => setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.1));
  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const renderGraph = () => {
    const nodeRadius = 20;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    return (
      <G transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {tasks.map((task, index) => {
          const angle = (index / tasks.length) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <G key={task.id}>
              {task.subtasks?.map((subtask, subIndex) => {
                const subAngle = angle + ((subIndex + 1) / (task.subtasks.length + 1) - 0.5) * Math.PI / 2;
                const subRadius = radius * 0.6;
                const subX = x + subRadius * Math.cos(subAngle);
                const subY = y + subRadius * Math.sin(subAngle);

                return (
                  <G key={`${task.id}-${subIndex}`}>
                    <Line
                      x1={x}
                      y1={y}
                      x2={subX}
                      y2={subY}
                      stroke="#88C0D0"
                      strokeWidth="2"
                    />
                    <Circle
                      cx={subX}
                      cy={subY}
                      r={nodeRadius * 0.7}
                      fill="#5E81AC"
                    />
                    <Text
                      x={subX}
                      y={subY}
                      fontSize="10"
                      fill="white"
                      textAnchor="middle"
                      alignmentBaseline="central"
                    >
                      {subtask.text.substring(0, 8)}
                    </Text>
                  </G>
                );
              })}
              <Circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill="#E1A95F"
              />
              <Text
                x={x}
                y={y}
                fontSize="12"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {task.text.substring(0, 10)}
              </Text>
            </G>
          );
        })}
      </G>
    );
  };

  return (
    <View style={styles.container}>
      <View 
        style={styles.graphContainer} 
        {...panResponder.panHandlers}
        onWheel={handleZoom}
      >
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`} ref={svgRef}>
          {renderGraph()}
        </Svg>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleZoomIn}>
          <RNText style={styles.buttonText}>+</RNText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleZoomOut}>
          <RNText style={styles.buttonText}>-</RNText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <RNText style={styles.buttonText}>Reset</RNText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setIsLocked(!isLocked)}>
          <RNText style={styles.buttonText}>{isLocked ? 'Unlock' : 'Lock'}</RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E3440',
  },
  graphContainer: {
    flex: 1,
    cursor: 'grab',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#3B4252',
  },
  button: {
    backgroundColor: '#4C566A',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default TaskMap;