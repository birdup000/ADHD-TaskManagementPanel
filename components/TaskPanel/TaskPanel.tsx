"use client";
import React, { useState } from 'react';
import Task from '@/types/task';

const TaskPanel: React.FC = () =>{
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Sample Task 1', status: 'open' },
    { id: '2', title: 'Sample Task 2', status: 'completed' },
  ]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) =>{
      e.preventDefault();
        if (newTaskTitle.trim() === '') return;
        const newTask: Task = {
          id: Date.now().toString(), // Simple ID generation for now
          title: newTaskTitle,
          status: 'open',
        };
        setTasks([...tasks, newTask]);
      setNewTaskTitle('');
  }

  return (
    &lt;div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg min-h-[300px] w-full max-w-md mx-auto"&gt;
      &lt;h2 className="text-2xl font-bold mb-4"&gt;Task Panel&lt;/h2&gt;
        &lt;form onSubmit={handleAddTask} className="mb-4"&gt;
            &lt;input
                type="text"
                value={newTaskTitle}
                onChange={(e) =>setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="bg-gray-800 text-white p-2 rounded w-full"
            /&gt;
            &lt;button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"&gt;
                Add Task
            &lt;/button&gt;
        &lt;/form&gt;

      &lt;ul&gt;
        {tasks.map((task) =>(
          &lt;li key={task.id} className="bg-gray-800 p-2 rounded mb-2 flex justify-between items-center"&gt;
            &lt;span className={task.status === 'completed' ? 'line-through' : ''}&gt;
              {task.title}
            &lt;/span&gt;
          &lt;/li&gt;
        ))}
      &lt;/ul&gt;
    &lt;/div&gt;
  );
};

export default TaskPanel;
