"use client";

import React, { useState, useRef } from 'react';
import { Task } from '../types/task';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface TaskAttachmentsProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  task,
  onUpdateTask,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (files: File[]) => {
    // In a real application, you would upload these files to your storage service
    // For now, we'll create mock attachments
    const newAttachments: Attachment[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // In production, this would be the uploaded file URL
      uploadedAt: new Date(),
      uploadedBy: 'current-user', // Replace with actual user ID from auth
    }));

    const updatedTask = {
      ...task,
      attachments: [...(task.attachments || []), ...newAttachments],
    };

    onUpdateTask(updatedTask);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedTask = {
      ...task,
      attachments: task.attachments?.filter(a => a.id !== attachmentId) || [],
    };

    onUpdateTask(updatedTask);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('sheet')) return '📝';
    return '📎';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Attachments</h4>
        <span className="text-xs text-gray-400">
          {task.attachments?.length || 0} files
        </span>
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-gray-400 hover:text-white"
        >
          <div className="text-2xl mb-2">📁</div>
          <p>Drop files here or click to upload</p>
          <p className="text-xs mt-1">Maximum file size: 10MB</p>
        </button>
      </div>

      {/* Attachments list */}
      <div className="space-y-2">
        {task.attachments?.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(attachment.type)}</span>
              <div>
                <p className="text-sm font-medium">{attachment.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.uploadedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={attachment.url}
                download={attachment.name}
                className="p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download"
              >
                ⬇️
              </a>
              <button
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {(!task.attachments || task.attachments.length === 0) && (
          <div className="text-center py-6 text-gray-400">
            <p>No attachments yet</p>
            <p className="text-sm">Upload files to share with collaborators</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAttachments;
