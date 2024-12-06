import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FaChevronDown,
  FaChevronRight,
  FaTasks,
  FaLink,
  FaEdit,
  FaSearch
} from 'react-icons/fa';
import NotesEditor from './NotesEditor';

interface Task {
  id: number;
  projectId: number;
  task: string;
  isComplete: boolean;
  description: string;
  dueDate: string | null;
  stage: 'toDo' | 'inProgress' | 'completed';
  lastEdited?: Date;
  notes: string;
}

interface Project {
  id: number;
  name: string;
  notes?: string;
  isExpanded?: boolean;
  permissions?: {
    canEditProjectNotes?: boolean;
    canEditTaskNotes?: boolean;
    canViewTaskNotes?: boolean;
  };
}

interface ProjectNotesEditorProps {
  project: Project;
  tasks: Task[];
  onProjectNotesChange: (notes: string) => void;
  onTaskNotesChange: (taskId: number, notes: string) => void;
  onTaskSelect: (taskId: number) => void;
  permissions?: {
    canEditProjectNotes?: boolean;
    canEditTaskNotes?: boolean;
    canViewTaskNotes?: boolean;
  };
}

const NoPermissionMessage = () => (
  <div className="text-sm text-gray-400 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
    You don't have permission to view or edit notes.
  </div>
);

const ProjectNotesEditor: React.FC<ProjectNotesEditorProps> & { displayName?: string } = ({
  project,
  tasks,
  onProjectNotesChange,
  onTaskNotesChange,
  onTaskSelect,
  permissions
}) => {
  const [showTaskNotes, setShowTaskNotes] = useState(true);
  const mounted = useRef(false);
  
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

  const filteredTasks = tasks.filter(task => 
    task.notes &&
    (searchQuery === '' || 
     task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
     task.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleTaskExpansion = useCallback((taskId: number) => {
    if (!mounted.current) return;
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Project Notes Section */}
      <div className="flex-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-100">Project Notes</h3>
          {!project.permissions?.canEditProjectNotes && (
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              Read Only
            </span>
          )}
        </div>
        {project.permissions?.canEditProjectNotes === false ? (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: project.notes || '' }} />
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Task Notes Overview:</h4>
                <div className="space-y-2">
                  {tasks.filter(task => task.notes).map(task => (
                    <div key={task.id} className="p-2 bg-gray-800 rounded border border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">{task.task}</span>
                        <button
                          onClick={() => onTaskSelect(task.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <FaEdit size={12} />
                          Edit Note
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: task.notes }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NotesEditor
            initialContent={project.notes ?? ''}
            onChange={onProjectNotesChange}
            readOnly={!project.permissions?.canEditProjectNotes || !permissions?.canEditProjectNotes}
          />
        )}
      </div>

      {/* Task Notes Section */}
      <div className="flex-1">
        {(!project.permissions?.canViewTaskNotes && permissions?.canViewTaskNotes === false) ? (
          <NoPermissionMessage />
        ) : (
          <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowTaskNotes(!showTaskNotes)}
          >
            {showTaskNotes ? <FaChevronDown /> : <FaChevronRight />}
            <h3 className="text-lg font-medium text-gray-100">Task Notes</h3>
            <span className="text-sm text-gray-400">
              ({filteredTasks.length})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search task notes..."
                className="pl-9 pr-4 py-1.5 bg-gray-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          </div>
        )}
        {showTaskNotes && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
              >
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700"
                  onClick={() => toggleTaskExpansion(task.id)}
                >
                  <div className="flex items-center gap-2">
                    <FaTasks className="text-gray-400" />
                    <span className="font-medium text-gray-200">{task.task}</span>
                    {task.lastEdited && (
                      <span className="text-xs text-gray-400">
                        (Updated: {new Date(task.lastEdited).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskSelect(task.id);
                      }}
                      className="p-1.5 hover:bg-gray-600 rounded-md transition-colors"
                      title="Go to task"
                    >
                      <FaLink className="text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskSelect(task.id);
                      }}
                      className="p-1.5 hover:bg-gray-600 rounded-md transition-colors"
                      title="Edit task"
                    >
                      <FaEdit className="text-gray-400" />
                    </button>
                    {expandedTasks.includes(task.id) ? (
                      <FaChevronDown className="text-gray-400" />
                    ) : (
                      <FaChevronRight className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedTasks.includes(task.id) && (
                  <div className="p-3 border-t border-gray-700">
                    <NotesEditor
                      initialContent={task.notes}
                      onChange={(content) => onTaskNotesChange(task.id, content)}
                      readOnly={!project.permissions?.canEditTaskNotes || !permissions?.canEditTaskNotes}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ProjectNotesEditor.displayName = 'ProjectNotesEditor';
export default ProjectNotesEditor;