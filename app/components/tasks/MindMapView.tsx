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
  const [tooltip, setTooltip] = useState<{ visible: boolean, content: string, x: number, y: number }>({ visible: false, content: '', x: 0, y: 0 });

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
    try {
      localStorage.setItem(MINDMAP_STORAGE_KEY, JSON.stringify(mindMap));
      // TODO: Transition to backend storage solution or provide export/import functionality for data persistence.
    } catch (error) {
      console.error('Failed to save mind map to localStorage:', error);
      // Notify user of potential data loss risk
      if (window.confirm('Warning: Unable to save mind map data. Changes may be lost on page refresh. Do you want to continue?')) {
        // User acknowledges the risk
      } else {
        // User may choose to take action, though we can't do much here
      }
    }
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

  // Responsive zoom level based on screen size
  const getResponsiveZoom = () => {
    const width = window.innerWidth;
    if (width < 768) return 0.6; // Mobile
    if (width < 1024) return 0.8; // Tablet
    return 1; // Desktop
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
  // Performance optimization: Memoize and debounce layout calculation for large mind maps
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

  // Custom debounce function
  const debounce = <T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    const debounced = function(this: unknown, ...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func.apply(this, args);
      };
      
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
    
    debounced.cancel = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    
    return debounced as ((...args: Parameters<T>) => void) & { cancel: () => void };
  };

  // Run layout calculation when mindMap changes with debouncing
  const debouncedCalculateLayout = useCallback(
    debounce(() => {
      calculateLayout();
    }, 100),
    [calculateLayout]
  );

  useEffect(() => {
    debouncedCalculateLayout();
    return () => debouncedCalculateLayout.cancel();
  }, [mindMap, debouncedCalculateLayout]);

  // Initial centering with responsive zoom
  useEffect(() => {
    if (svgRef.current) {
      setZoom(getResponsiveZoom());
      setPan({
        x: (window.innerWidth / 2),
        y: (window.innerHeight / 3)
      });
    }
    const handleResize = () => {
      setZoom(getResponsiveZoom());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts for navigation and actions
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
        } else if (key === '+' || key === '=') {
          e.preventDefault();
          setZoom(prev => Math.min(prev + 0.1, 2));
        } else if (key === '-') {
          e.preventDefault();
          setZoom(prev => Math.max(prev - 0.1, 0.1));
        }
      } else if (selectedNode) {
        const node = mindMap.nodes[selectedNode];
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleNodeCollapse(selectedNode);
        } else if (e.key === 'ArrowRight' && node.children && node.children.length > 0 && !node.isCollapsed) {
          e.preventDefault();
          setSelectedNode(node.children[0]);
        } else if (e.key === 'ArrowLeft' && node.parentId) {
          e.preventDefault();
          setSelectedNode(node.parentId);
        } else if (e.key === 'ArrowUp' && node.parentId) {
          e.preventDefault();
          const parent = mindMap.nodes[node.parentId];
          const index = parent.children?.indexOf(selectedNode) || 0;
          if (index > 0) {
            setSelectedNode(parent.children![index - 1]);
          }
        } else if (e.key === 'ArrowDown' && node.parentId) {
          e.preventDefault();
          const parent = mindMap.nodes[node.parentId];
          const index = parent.children?.indexOf(selectedNode) || 0;
          if (index < (parent.children?.length || 0) - 1) {
            setSelectedNode(parent.children![index + 1]);
          }
        }
      } else if (!selectedNode && mindMap.rootId) {
        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          setSelectedNode(mindMap.rootId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, undo, redo, toggleNodeCollapse, mindMap.nodes, setSelectedNode]);
  
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);

  return (
    <div
      className="h-full w-full bg-bg-secondary relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => {
        handleMouseMove(e);
        if (tooltip.visible) {
          setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
        }
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      tabIndex={0}
      role="application"
      aria-label="Interactive Mind Map for Task Planning"
      aria-describedby="mindmap-description"
    >
      <div id="mindmap-description" className="sr-only">
        This interactive mind map allows you to visualize and organize tasks and ideas hierarchically. Use arrow keys to navigate between nodes, Space or Enter to collapse or expand nodes, and Ctrl+Z or Ctrl+Y for undo and redo actions. Click and drag to pan the view, and use Ctrl+Plus or Ctrl+Minus to zoom in and out.
      </div>
      {/* Help and Simplified Mode Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          className="bg-accent-primary text-text-onAccent px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-focus"
          onClick={() => alert('Mind Map Help: Use arrow keys to navigate nodes, Space/Enter to collapse/expand, Ctrl+Z/Y to undo/redo, Ctrl+/- to zoom. Click and drag to pan the view.')}
          aria-label="Show mind map help instructions"
        >
          Help
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-focus ${isSimplifiedMode ? 'bg-accent-primary text-text-onAccent' : 'bg-bg-tertiary text-text-secondary'}`}
          onClick={() => setIsSimplifiedMode(!isSimplifiedMode)}
          aria-label={isSimplifiedMode ? "Switch to detailed mode" : "Switch to simplified mode for easier interaction"}
          aria-pressed={isSimplifiedMode}
        >
          {isSimplifiedMode ? 'Detailed' : 'Simplified'}
        </button>
      </div>
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute bg-bg-elevated text-text-primary text-sm p-2 rounded-md shadow-lg max-w-xs z-50"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          {tooltip.content}
        </div>
      )}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x + dragOffset.x}px, ${pan.y + dragOffset.y}px) scale(${zoom})`
        }}
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mind Map Diagram"
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
              className={`${
                node.status === 'task' ? 'text-accent-secondary' :
                node.status === 'completed' ? 'text-accent-success' : 'text-border-default'
              } opacity-30`}
              aria-label={`Connection from ${mindMap.nodes[node.parentId].content} to ${node.content}`}
            />
          )
        ))}
        
        {/* Render nodes with virtualization consideration */}
        {Object.values(mindMap.nodes).map(node => (
          // Implement lazy loading or virtualization for large datasets
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
        <br />
        <strong>Onboarding Tip:</strong> Start by clicking the root node to add ideas or convert them to tasks.
      </div>
      <div className="absolute top-4 right-4 text-sm text-text-secondary">
        Mind map data is saved automatically
      </div>
    </div>
  );
};

export default MindMapView;