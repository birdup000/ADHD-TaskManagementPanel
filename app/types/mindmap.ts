export interface MindMapNode {
  id: string;
  parentId: string | null;
  content: string;
  children: string[];
  status: 'idea' | 'task' | 'completed';
  taskId?: string; // Reference to actual task if this node is a task
  x?: number; // For layout positioning
  y?: number;
}

export interface MindMap {
  id: string;
  name: string;
  rootId: string;
  nodes: { [key: string]: MindMapNode };
}