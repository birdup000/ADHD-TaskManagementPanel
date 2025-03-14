import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MindMap, MindMapNode, MindMapHistory } from '../../types/mindmap';
import { Task } from '../../types/task';
import MindMapNodeComponent from './MindMapNode';

interface MindMapViewProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskCreate: (task: Partial<Task>) => void;
}

const MindMapView: React.FC<MindMapViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskCreate,
}) => {
  // Constants
  const MINDMAP_STORAGE_KEY = 'adhd-panel-mindmap';
  const MAX_HISTORY_STEPS = 50;

  // Default mind map structure
  const defaultMindMap: MindMap = {
    id: 'default',
    name: 'Task Planning',
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        parentId: null,
        content: 'Main Goal',
        children: [],
        status: 'idea',
        isCollapsed: false
      }
    }
  };

  // History management
  const [history, setHistory] = useState<MindMapHistory>({
    past: [],
    present: defaultMindMap,
    future: [],
    maxSteps: MAX_HISTORY_STEPS
  });

  // View state
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get current mindMap from history
  const mindMap = history.present;

  // Update mindMap through history management
  const updateMindMap = useCallback((newMindMap: MindMap) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present].slice(-MAX_HISTORY_STEPS),
      present: newMindMap,
      future: [],
      maxSteps: MAX_HISTORY_STEPS
    }));
  }, []);

  // Undo/Redo functions
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
        maxSteps: MAX_HISTORY_STEPS
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const [newPresent, ...newFuture] = prev.future;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
        maxSteps: MAX_HISTORY_STEPS
      };
    });
  }, []);

  // Load mind map data on mount
  useEffect(() => {
    const validateMindMap = (map: unknown): map is MindMap => {
      if (!map || typeof map !== 'object' || map === null) return false;
      
      const mindMap = map as Record<string, unknown>;
      
      if (typeof mindMap.id !== 'string') return false;
      if (typeof mindMap.name !== 'string') return false;
      if (typeof mindMap.rootId !== 'string') return false;
      if (!mindMap.nodes || typeof mindMap.nodes !== 'object') return false;
      
      // Validate each node
      const nodes = mindMap.nodes as Record<string, unknown>;
      
      for (const nodeId in nodes) {
        const node = nodes[nodeId] as Record<string, unknown>;
        if (!node || typeof node !== 'object' || node === null) return false;
        
        if (typeof node.id !== 'string' ||
            (node.parentId !== null && typeof node.parentId !== 'string') ||
            typeof node.content !== 'string' ||
            !Array.isArray(node.children)) return false;
            
        const status = node.status as string;
        const validStatus = ['idea', 'task', 'completed'].includes(status);
        if (!validStatus) return false;
      }

      return true;
    };

    const loadMindMap = () => {
      const stored = localStorage.getItem(MINDMAP_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (validateMindMap(parsed)) {
            setHistory({ past: [], present: parsed, future: [], maxSteps: MAX_HISTORY_STEPS });
          } else {
            console.error('Invalid mind map structure in storage');
            setHistory({ past: [], present: defaultMindMap, future: [], maxSteps: MAX_HISTORY_STEPS });
          }
        } catch (error) {
          console.error('Error parsing mind map from storage:', error);
          setHistory({ past: [], present: defaultMindMap, future: [], maxSteps: MAX_HISTORY_STEPS });
        }
      }
    };
    loadMindMap();
  }, []);

  // Save mind map data on changes
  useEffect(() => {
    localStorage.setItem(MINDMAP_STORAGE_KEY, JSON.stringify(mindMap));
  }, [mindMap]);

  // Add existing tasks as nodes
  useEffect(() => {
    const newNodes = { ...mindMap.nodes };
    let hasChanges = false;

    tasks.forEach(task => {
      if (!newNodes[`task-${task.id}`]) {
        hasChanges = true;
        newNodes[`task-${task.id}`] = {
          id: `task-${task.id}`,
          parentId: mindMap.rootId,
          content: task.title,
          children: [],
          status: 'task',
          isCollapsed: false,
          taskId: task.id
        };
        newNodes[mindMap.rootId].children.push(`task-${task.id}`);
      }
    });

    if (hasChanges) {
      updateMindMap({ ...mindMap, nodes: newNodes });
    }
  }, [tasks, mindMap, updateMindMap]);

  // Handle zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom(prevZoom => Math.min(Math.max(0.1, prevZoom + delta), 2));
  };

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) { // Middle mouse or left click
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragOffset({ x: dx, y: dy });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setPan(prev => ({
        x: prev.x + dragOffset.x,
        y: prev.y + dragOffset.y
      }));
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Reset view to center
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    const node = mindMap.nodes[nodeId];
    if (node.taskId) onTaskSelect(node.taskId);
  };

  // Reset mind map to default
  const resetMindMap = () => {
    if (window.confirm('Are you sure you want to reset the mind map? This will clear all your ideas.')) {
      updateMindMap(defaultMindMap);
      resetView();
      setSelectedNode(null);
    }
  };

  const addNode = (parentId: string) => {
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      parentId,
      content: 'New Idea',
      children: [],
      status: 'idea',
      isCollapsed: false
    };

    const parent = mindMap.nodes[parentId];
    const newMindMap = {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [parentId]: {
          ...parent,
          children: [...parent.children, newNode.id]
        },
        [newNode.id]: newNode
      }
    };

    updateMindMap(newMindMap);
  };

  const convertToTask = (nodeId: string) => {
    const node = mindMap.nodes[nodeId];
    const newTask: Partial<Task> = {
      title: node.content,
      status: 'todo',
      description: '',
    };
    onTaskCreate(newTask);
  };

  const updateNodeContent = (nodeId: string, content: string) => {
    const newMindMap = {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [nodeId]: {
          ...mindMap.nodes[nodeId],
          content
        }
      }
    };
    updateMindMap(newMindMap);
  };

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    const newMindMap = {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [nodeId]: {
          ...mindMap.nodes[nodeId],
          isCollapsed: !mindMap.nodes[nodeId].isCollapsed
        }
      }
    };
    updateMindMap(newMindMap);
  }, [mindMap, updateMindMap]);

  // Layout calculation with centered root
  const calculateLayout = useCallback(() => {
    const nodeWidth = 160;
    const verticalSpacing = 50;
    const levelHeight = 100;
    const levelWidths: { [key: string]: number } = {};
    const levels: { [key: string]: string[] } = {};

    // Calculate levels for each node
    const assignLevels = (nodeId: string, level: number) => {
      if (!levels[level]) levels[level] = [];
      levels[level].push(nodeId);

      const node = mindMap.nodes[nodeId];
      if (!node || !node.children) return;

      // Only process children if node is not collapsed
      if (!node.isCollapsed) {
        node.children.forEach(childId => assignLevels(childId, level + 1));
      }
    };

    assignLevels(mindMap.rootId, 0);

    // Calculate x positions for nodes at each level
    Object.entries(levels).forEach(([level, nodeIds]) => {
      const levelWidth = nodeIds.length * nodeWidth;
      levelWidths[level] = levelWidth;
      
      const startX = -(levelWidth / 2);
      nodeIds.forEach((nodeId, index) => {
        if (!mindMap.nodes[nodeId]) return;
        const node = mindMap.nodes[nodeId];
        node.x = startX + (index * nodeWidth) + (nodeWidth / 2);
        node.y = Number(level) * (levelHeight + verticalSpacing);
      });
    });
  }, [mindMap]);

  // Run layout calculation when mindMap changes
  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  // Initial centering
  useEffect(() => {
    if (svgRef.current) {
      setPan({
        x: (window.innerWidth / 2),
        y: (window.innerHeight / 3)
      });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          redo();
        }
      } else if (selectedNode && e.key === ' ') {
        e.preventDefault();
        toggleNodeCollapse(selectedNode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, undo, redo, toggleNodeCollapse]);

  return (
    <div 
      className="h-full w-full bg-bg-secondary relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x + dragOffset.x}px, ${pan.y + dragOffset.y}px) scale(${zoom})`
        }}
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render connections */}
        {Object.values(mindMap.nodes).map(node => (
          node.parentId && !mindMap.nodes[node.parentId].isCollapsed && (
            <line
              key={`line-${node.id}`}
              x1={mindMap.nodes[node.parentId].x || 0}
              y1={(mindMap.nodes[node.parentId].y || 0) + 20}
              x2={node.x || 0}
              y2={(node.y || 0) - 20}
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-30"
            />
          )
        ))}
        
        {/* Render nodes */}
        {Object.values(mindMap.nodes).map(node => (
          <MindMapNodeComponent
            key={node.id}
            node={node}
            selected={selectedNode === node.id}
            onSelect={handleNodeSelect}
            onContentChange={updateNodeContent}
            onCollapse={() => toggleNodeCollapse(node.id)}
          />
        ))}
      </svg>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black/20 backdrop-blur p-4 rounded-lg shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            className="bg-accent-primary text-white px-3 py-2 rounded-md"
            title="Zoom In"
          >
            <span className="text-xl">+</span>
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
            className="bg-accent-primary text-white px-3 py-2 rounded-md"
            title="Zoom Out"
          >
            <span className="text-xl">-</span>
          </button>
          <button
            onClick={resetView}
            className="bg-accent-primary text-white px-3 py-2 rounded-md"
            title="Reset View"
          >
            <span className="text-sm">Reset View</span>
          </button>
          <button
            onClick={resetMindMap}
            className="bg-red-500 text-white px-3 py-2 rounded-md"
            title="Reset Mind Map"
          >
            <span className="text-sm">Reset Map</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => selectedNode && addNode(selectedNode)}
            className="bg-accent-primary text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedNode}
          >
            Add Idea
          </button>
          <button
            onClick={() => selectedNode && convertToTask(selectedNode)}
            className="bg-accent-secondary text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedNode || mindMap.nodes[selectedNode].status === 'task'}
          >
            Convert to Task
          </button>
        </div>
      </div>
      <div className="absolute top-4 left-4 text-sm text-text-secondary">
        Click and drag to pan • Scroll to zoom • Click node to select • Double-click to edit • Press Space to collapse/expand
        <br />
        Ctrl+Z to undo • Ctrl+Shift+Z/Ctrl+Y to redo • Press Enter to save edit • Existing tasks shown as nodes
      </div>
      <div className="absolute top-4 right-4 text-sm text-text-secondary">
        Mind map data is saved automatically
      </div>
    </div>
  );
};

export default MindMapView;