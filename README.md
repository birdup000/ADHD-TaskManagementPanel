⚠️ **WARNING: Under Heavy Development!** ⚠️

The AGiXT integrations for this project are currently undergoing heavy development. Expect frequent changes, potential instability, and features that may not be fully functional. Your patience and feedback are appreciated!

# ADHD Task Management Panel

The ADHD Task Management Panel is a modern, intuitive task management application designed to help individuals with ADHD focus and manage their tasks effectively. The application features a drag-and-drop Kanban board, advanced search and filtering, keyboard shortcuts, and multiple views to enhance productivity.

## Features
- Drag-and-drop task management with Kanban board
- Advanced search and filtering functionality
- Keyboard shortcuts for improved productivity
- Mobile responsive design
- Multiple views (Kanban, List, Calendar)
- Task prioritization and organization
- Rich text editing for task descriptions
- Tag and assignee management
- Visual feedback for interactions
- Customizable themes
- AGiXT Integration for AI-powered task management

## Prerequisites
- Docker and Docker Compose installed on your system
- AGiXT running on port 7437 (see AGiXT setup instructions below)

## Installation Instructions

### Using Docker (Recommended)
1. Clone the repository: 
   ```bash
   git clone https://github.com/birdup000/ADHD-TaskManagementPanel.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ADHD-TaskManagementPanel
   ```
3. Make sure AGiXT is running and its Docker network is created:
   ```bash
   # AGiXT should be running with its default network 'agixt_default'
   # The frontend will connect to AGiXT at http://agixt:7437
   ```
4. Start the application:
   ```bash
   docker-compose up -d
   ```
5. Access the application at http://localhost:3000

### Manual Installation
1. Clone the repository: 
   ```bash
   git clone https://github.com/birdup000/ADHD-TaskManagementPanel.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ADHD-TaskManagementPanel
   ```
3. Install dependencies:
   ```bash
   npm install --peer-legacy-deps
   ```
4. Create a .env.local file:
   ```bash
   NEXT_PUBLIC_AGIXT_URL=http://localhost:7437
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## AGiXT Integration
The application integrates with AGiXT for enhanced task management capabilities:

1. Make sure AGiXT is running and accessible (default: http://localhost:7437)
2. Log in using your AGiXT credentials
3. The application will automatically connect to AGiXT for AI-powered features

## Usage Examples
- Use the search bar to quickly find tasks
- Drag tasks between columns to update their status
- Click on a task to view and edit details
- Use keyboard shortcuts for faster navigation
- Sort and filter tasks by various criteria
- Add tags and assignees for better organization
- Leverage AGiXT's AI capabilities for task management

## About
A panel to help with focusing 😄

## Topics
- Task
- School
- Motivation
- Tasks
- Work
- Focus
- Time-management
- Hyperfocus
- ADHD
- Focusing

## Technologies Used
- TypeScript
- JavaScript
- Next.js
- Docker
- AGiXT Integration
