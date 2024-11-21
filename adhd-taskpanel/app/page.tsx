import type { NextPage } from 'next';
import Head from 'next/head';
import { 
  FaHome, FaInbox, FaSearch, FaColumns, FaList, FaFileAlt, FaBook, FaPlus, FaCog, FaEllipsisH
} from 'react-icons/fa';

const Page: NextPage = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Head>
        <title>AI-Enhanced Task List UI</title>
      </Head>
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">AI Workspace</h1>
          <FaCog size={24} className="mr-2" />
        </div>
        <input
          type="text"
          placeholder="Search tasks or get suggestions"
          className="w-full p-2 bg-gray-800 rounded text-white mb-4"
        />
        {/* Navigation Links */}
        <ul className="mb-4">
          <li className="flex items-center mb-2">
            <FaHome size={20} className="mr-2" />
            Home
          </li>
          <li className="flex items-center mb-2">
            <FaInbox size={20} className="mr-2" />
            Inbox
          </li>
          <li className="flex items-center mb-2">
            <FaSearch size={20} className="mr-2" />
            AI Insights
          </li>
          <li className="flex items-center mb-2">
            <FaColumns size={20} className="mr-2" />
            Kanban View
          </li>
          <li className="flex items-center mb-2">
            <FaList size={20} className="mr-2" />
            Task List
          </li>
        </ul>
        {/* Projects Section */}
        <h2 className="text-sm font-bold mb-2">Projects</h2>
        <ul>
          <li className="flex items-center mb-2">
            <FaFileAlt size={20} className="mr-2" />
            Project Alpha
          </li>
          <li className="flex items-center mb-2">
            <FaBook size={20} className="mr-2" />
            Learning Hub
          </li>
          <li className="flex items-center mb-2">
            <FaPlus size={20} className="mr-2" />
            New Project
          </li>
        </ul>
      </div>
      {/* Main Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Task Dashboard</h1>
          <div className="flex items-center">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">New Task</button>
            <FaEllipsisH size={24} />
          </div>
        </div>
        {/* Content */}
        <div className="flex flex-1">
          {/* Task List View */}
          <div className="w-2/3 p-4">
            <h2 className="text-2xl font-bold mb-4">Task List</h2>
            <ul>
              <li className="bg-gray-800 p-4 rounded mb-2">
                <h3 className="text-lg font-bold">Finish Project Proposal</h3>
                <p className="text-sm text-gray-500">Due: Nov 25, 2024</p>
                <p className="text-sm text-gray-400">AI Suggestion: You can run "Get Subtasks" to break this task down.</p>
              </li>
              <li className="bg-gray-800 p-4 rounded mb-2">
                <h3 className="text-lg font-bold">Prepare Presentation</h3>
                <p className="text-sm text-gray-500">Due: Nov 30, 2024</p>
                <p className="text-sm text-gray-400">AI Suggestion: You can run "Add Collaborators" to involve your team.</p>
              </li>
            </ul>
            {/* Kanban Workflow */}
            <h2 className="text-2xl font-bold mt-8 mb-4">Kanban for <span id="selected-task">Selected Task</span></h2>
            <div className="flex space-x-4">
              <div className="w-1/3 bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-bold mb-2">To Do</h3>
                <div className="bg-gray-700 p-2 rounded mb-2">Sample Task 1</div>
                <div className="bg-gray-700 p-2 rounded">+ Add Task</div>
              </div>
              <div className="w-1/3 bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-bold mb-2">In Progress</h3>
                <div className="bg-gray-700 p-2 rounded mb-2">Sample Task 2</div>
                <div className="bg-gray-700 p-2 rounded">+ Add Task</div>
              </div>
              <div className="w-1/3 bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-bold mb-2">Completed</h3>
                <div className="bg-gray-700 p-2 rounded mb-2">Sample Task 3</div>
                <div className="bg-gray-700 p-2 rounded">+ Add Task</div>
              </div>
            </div>
          </div>
          {/* Task Details Panel */}
          <div className="w-1/3 p-4 border-l border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Task Details</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Get Subtasks</button>
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Add Collaborators</button>
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm col-span-2">Tag GitHub Project</button>
            </div>
            <div className="mb-4">
              <p><span className="font-bold">Due Date</span>: <span className="text-gray-500">Nov 25, 2024</span></p>
              <p><span className="font-bold">Status</span>: <span className="text-gray-500">In Progress</span></p>
            </div>
            <div className="mb-4">
              <button className="bg-gray-800 text-white px-2 py-1 rounded text-sm">Add Subtasks</button>
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Add a label..." className="w-full p-2 bg-gray-800 rounded text-white mb-2" />
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Add Label</button>
            </div>
            <input type="text" placeholder="Add a comment..." className="w-full p-2 bg-gray-800 rounded text-white mb-4" />
          </div>
          {/* Automation Panel */}
          <div className="w-1/4 bg-gray-900 p-4 border-l border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Automation</h2>
            <div className="mb-4">
              <label htmlFor="agent-selection" className="block text-sm font-bold mb-2">Select Agent:</label>
              <select id="agent-selection" className="w-full p-2 bg-gray-800 rounded text-white mb-4">
                <option value="agent-1">Agent 1</option>
                <option value="agent-2">Agent 2</option>
                <option value="agent-3">Agent 3</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="automation-type" className="block text-sm font-bold mb-2">Select Automation Type:</label>
              <select id="automation-type" className="w-full p-2 bg-gray-800 rounded text-white mb-4">
                <option value="run-chain">Run Chain</option>
                <option value="run-prompt">Run Prompt</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="automation-input" className="block text-sm font-bold mb-2">Input:</label>
              <textarea id="automation-input" rows={4} placeholder="Enter your prompt or chain..." className="w-full p-2 bg-gray-800 rounded text-white mb-4"></textarea>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">Execute</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;