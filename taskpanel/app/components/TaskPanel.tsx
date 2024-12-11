import React from 'react';

import TaskCard from './TaskCard';
import ThemeSelector from './ThemeSelector';
import TaskForm from './TaskForm';
import ViewSelector from './ViewSelector';
import CalendarView from './CalendarView';
import ListView from './ListView';
import IntegrationButton from './IntegrationButton';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type ViewType = 'kanban' | 'list' | 'calendar';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ThemeProvider } from '../hooks/useTheme';

const TaskPanel: React.FC = () => {
  const [showIntegrations, setShowIntegrations] = React.useState(false);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [comments, setComments] = React.useState<Record<string, Comment[]>>({});
  const [currentView, setCurrentView] = React.useState<ViewType>('kanban');
  const [theme, setTheme] = React.useState(colors.dark);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showAI, setShowAI] = React.useState(false);

  const sampleTask = {
    id: '1',
    title: 'Implement Dark Mode',
    description: 'Add dark mode support with multiple theme options',
    priority: 'high' as const,
    status: 'in-progress' as const,
    dueDate: new Date('2024-03-01'),
    assignees: ['John', 'Alice'],
    tags: ['UI', 'Feature']
  };
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId;
    const destinationStatus = result.destination.droppableId;
    const taskId = result.draggableId;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status: destinationStatus as Task['status'],
    };

    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };

  return (
    <ThemeProvider value={{ theme, setTheme }}>
    <div style={{ backgroundColor: theme.primary }} className="min-h-screen text-white">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Midnight Eclipse</h1>
          <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
          <div className="flex items-center space-x-4">
            <ThemeSelector currentTheme={theme.name} onThemeChange={setTheme} />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAI(true)}
                className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                title="AI Assistant"
              >
                🤖
              </button>
              <button
                onClick={() => setShowIntegrations(true)}
                className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                title="Integrations"
              >
                🔌
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                title="Account"
              >
                👤
              </button>
              <button 
                onClick={() => setIsEditorOpen(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                New Task
              </button>
            </div>
          </div>
        </header>
        
        <DragDropContext onDragEnd={onDragEnd}>
        <main className={currentView === 'calendar' ? '' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}>
          {/* Todo Column */}
          <Droppable droppableId="todo">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-[#2A2A2A] rounded-lg p-4"
              >
                <h2 className="text-xl font-semibold mb-4">To Do</h2>
                {tasks.filter(task => task.status === 'todo').map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard {...task} onClick={() => setSelectedTask(task)} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* In Progress Column */}
          <Droppable droppableId="in-progress">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-[#2A2A2A] rounded-lg p-4"
              >
                <h2 className="text-xl font-semibold mb-4">In Progress</h2>
                <TaskCard {...sampleTask} onClick={() => setSelectedTask(sampleTask)} />
                {tasks.filter(task => task.status === 'in-progress').map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard {...task} onClick={() => setSelectedTask(task)} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {isEditorOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#212121] p-6 rounded-lg w-full max-w-2xl mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create New Task</h2>
                  <button 
                    onClick={() => setIsEditorOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <TaskForm 
                  onSubmit={(task) => {
                    setTasks([...tasks, task]);
                    setIsEditorOpen(false);
                  }}
                  onCancel={() => setIsEditorOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Done Column */}
          <Droppable droppableId="done">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-[#2A2A2A] rounded-lg p-4"
              >
                <h2 className="text-xl font-semibold mb-4">Done</h2>
                {tasks.filter(task => task.status === 'done').map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard {...task} onClick={() => setSelectedTask(task)} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Task Details Modal */}
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdateTask={(updatedTask) => {
                setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                setSelectedTask(updatedTask);
              }}
              comments={comments[selectedTask.id] || []}
              onAddComment={(taskId, comment) => {
                const newComment = {
                  ...comment,
                  id: Date.now().toString(),
                  createdAt: new Date(),
                };
                setComments({
                  ...comments,
                  [taskId]: [...(comments[taskId] || []), newComment],
                });
              }}
            />
          )}
        {currentView === 'list' && (
            <ListView
              tasks={[...tasks, sampleTask]}
              onTaskClick={(task) => {
                // Handle task click in list view
                console.log('Task clicked:', task);
              }}
            />
          )}
          {currentView === 'calendar' && (
            <CalendarView
              tasks={[...tasks, sampleTask]}
              onTaskClick={(task) => {
                // Handle task click in calendar view
                console.log('Task clicked:', task);
              }}
            />
          )}

          {/* Integrations Modal */}
          {showIntegrations && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Integrations</h2>
                  <button
                    onClick={() => setShowIntegrations(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <IntegrationButton
                    type="google"
                    onClick={() => {
                      console.log('Connecting to Google Calendar...');
                      // Implement Google Calendar OAuth flow
                    }}
                  />
                  <IntegrationButton
                    type="slack"
                    onClick={() => {
                      console.log('Connecting to Slack...');
                      // Implement Slack OAuth flow
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
        </DragDropContext>

        {showLogin && <LoginForm />}
        {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
      </div>
    </div>
    </ThemeProvider>
  );
};

export default TaskPanel;