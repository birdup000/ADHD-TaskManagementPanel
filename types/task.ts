interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'high' | 'medium' | 'low';
  status: 'open' | 'in progress' | 'completed';
}

export default Task;
