import React from 'react';
import { Task } from '../types/task';
import html2canvas from 'html2canvas';

interface ExportMenuProps {
  tasks: Task[];
  onClose: () => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ tasks, onClose }) => {
  const handlePrint = () => {
    const printContent = tasks.map(task => `
      Task: ${task.title}
      Description: ${task.description || 'N/A'}
      Status: ${task.status}
      Priority: ${task.priority}
      Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
      ${task.subtasks?.length ? `\nSubtasks:\n${task.subtasks.map(st => `- ${st.title}`).join('\n')}` : ''}
      ${task.tags?.length ? `\nTags: ${task.tags.join(', ')}` : ''}
      ${task.assignees?.length ? `\nAssignees: ${task.assignees.join(', ')}` : ''}
      \n-------------------\n
    `).join('\n');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Task List</title>
            <style>
              body { font-family: Arial, sans-serif; white-space: pre-wrap; padding: 20px; }
            </style>
          </head>
          <body>
            <h1>Task List</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyTasks = async () => {
    const taskText = tasks.map(task => `
Task: ${task.title}
Description: ${task.description || 'N/A'}
Status: ${task.status}
Priority: ${task.priority}
Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
${task.subtasks?.length ? `\nSubtasks:\n${task.subtasks.map(st => `- ${st.title}`).join('\n')}` : ''}
${task.tags?.length ? `\nTags: ${task.tags.join(', ')}` : ''}
${task.assignees?.length ? `\nAssignees: ${task.assignees.join(', ')}` : ''}
-------------------
    `).join('\n');

    try {
      await navigator.clipboard.writeText(taskText);
      alert('Tasks copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy tasks:', err);
      alert('Failed to copy tasks to clipboard');
    }
  };

  const handleScreenshot = async () => {
    const taskBoard = document.querySelector('.task-board');
    if (taskBoard) {
      try {
        const canvas = await html2canvas(taskBoard as HTMLElement);
        const link = document.createElement('a');
        link.download = 'task-board.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error('Failed to capture screenshot:', err);
        alert('Failed to capture screenshot');
      }
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 bg-[#2A2A2A] rounded-md shadow-lg z-10 min-w-[200px]">
      <button
        onClick={handlePrint}
        className="w-full px-4 py-2 text-left hover:bg-[#333333] flex items-center gap-2"
      >
        <span>🖨️</span> Print Tasks
      </button>
      <button
        onClick={handleScreenshot}
        className="w-full px-4 py-2 text-left hover:bg-[#333333] flex items-center gap-2"
      >
        <span>📸</span> Save Screenshot
      </button>
      <button
        onClick={handleCopyTasks}
        className="w-full px-4 py-2 text-left hover:bg-[#333333] flex items-center gap-2"
      >
        <span>📋</span> Copy All Tasks
      </button>
      <button
        onClick={() => {
          const csv = tasks.map(t => {
            return [
              t.title,
              t.description,
              t.status,
              t.priority,
              t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
              t.tags?.join(', ') || '',
              t.assignees?.join(', ') || ''
            ].join(',');
          }).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'tasks.csv';
          a.click();
        }}
        className="w-full px-4 py-2 text-left hover:bg-[#333333] flex items-center gap-2"
      >
        <span>📊</span> Export CSV
      </button>
    </div>
  );
};

export default ExportMenu;
