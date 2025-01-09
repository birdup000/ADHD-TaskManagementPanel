import React from 'react';

interface TaskDetailsDrawerProps {
  task: any;
  onClose: () => void;
}

const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ task, onClose }) => {
  return (
    <div>
      TaskDetailsDrawer
    </div>
  );
};

export default TaskDetailsDrawer;