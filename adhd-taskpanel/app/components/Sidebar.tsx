"use client";

import React from 'react';
import {
  FaChevronRight,
  FaChevronDown,
  FaPlus,
  FaEllipsisH,
  FaTrash,
  FaEdit,
} from 'react-icons/fa';
import type { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onProjectSelect: (project: Project) => void;
  onAddProject: () => void;
  onDeleteProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onProjectExpandToggle: (project: Project) => void;
}

export default function Sidebar({
  projects,
  selectedProject,
  collapsed,
  onCollapsedChange,
  onProjectSelect,
  onAddProject,
  onDeleteProject,
  onEditProject,
  onProjectExpandToggle,
}: SidebarProps) {
  return (
    <div
      className={`flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50
        transition-all duration-200 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Projects
          </h2>
        )}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaChevronRight
            size={16}
            className={`text-gray-500 transform transition-transform duration-200
              ${collapsed ? "rotate-0" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {projects.map((project) => (
          <div key={project.id} className="relative group">
            <div
              onClick={() => onProjectSelect(project)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer
                ${selectedProject?.id === project.id
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onProjectExpandToggle(project);
                }}
                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {project.isExpanded ? (
                  <FaChevronDown size={12} />
                ) : (
                  <FaChevronRight size={12} />
                )}
              </button>
              
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-sm">
                    {project.name}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Edit project"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label="Delete project"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add Project Button */}
        {!collapsed && (
          <button
            onClick={onAddProject}
            className="w-full flex items-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700
              rounded-lg transition-colors"
          >
            <FaPlus size={12} />
            <span>Add Project</span>
          </button>
        )}
      </div>
    </div>
  );
}