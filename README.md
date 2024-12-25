# ADHD-Focused Task Management Panel

> [!WARNING]  
> Unstable Development Phase
Task Panel is currently undergoing significant changes, which may impact its stability. Expect potential issues until our scheduled stabilization milestone in early 2025 , where we will release more reliable versions. 


Welcome to the ADHD-Focused Task Management Panel! This application is specifically designed to cater to the unique needs of individuals with ADHD, helping them stay organized, focused, and productive. By leveraging the power of AI through AGiXT integration, alongside an intuitive and user-friendly interface, this tool aims to transform the way you manage tasks.

## Key Features

-   **Intuitive Kanban Boards**: Visualize your workflow with customizable Kanban boards. Easily drag and drop tasks between stages to track progress and maintain momentum.
-   **Smart Task Prioritization**: Automatically prioritize tasks based on due dates, importance, and effort, helping you focus on what truly matters.
-   **Distraction-Free Mode**: Minimize visual clutter and distractions with a streamlined interface designed to enhance concentration.
-   **AI-Powered Task Suggestions**: Receive intelligent suggestions for task breakdown, scheduling, and prioritization, powered by AGiXT.
-   **Timeboxing and Pomodoro Timer**: Implement proven time management techniques to boost productivity and maintain focus for set intervals.
-   **Customizable Reminders and Notifications**: Set personalized reminders to stay on track without feeling overwhelmed.
-   **Progress Tracking and Analytics**: Monitor your productivity trends and achievements with insightful analytics, tailored to your unique work patterns.
-   **Seamless Integration with AGiXT**: Leverage advanced AI capabilities for task analysis, generation, and management, making your task management smarter and more adaptive.
-   **Cross-Platform Synchronization**: Access your tasks and stay organized across all your devices with real-time synchronization.
-   **Collaboration Tools**: Share tasks and collaborate with team members or support networks, enhancing accountability and teamwork.
-   **Personalized Themes and Layouts**: Customize the look and feel of your task management panel to suit your preferences and reduce sensory overload.

## Getting Started

### Prerequisites

-   Docker and Docker Compose (for containerized deployment)
-   Node.js (version 20.x or later) and npm (for local development)
-   An operational AGiXT instance for AI-powered features

### Installation

#### Using Docker (Recommended)

1. Clone this repository:

    ```bash
    git clone https://github.com/birdup000/ADHD-TaskManagementPanel.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ADHD-TaskManagementPanel
    ```

3. Ensure AGiXT is running and its Docker network is created. The frontend will connect to AGiXT at the specified URL (default: `http://agixt:7437`).

4. Start the application using Docker Compose:

    ```bash
    docker-compose up -d
    ```

5. Access the application via your web browser at `http://localhost:3000`.

#### Manual Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/birdup000/ADHD-TaskManagementPanel.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ADHD-TaskManagementPanel
    ```

3. Install the required dependencies:

    ```bash
    npm install --legacy-peer-deps
    ```

4. Create a `.env.local` file in the root directory and configure the following variables:

    ```bash
    NEXT_PUBLIC_AGIXT_URL=http://your-agixt-instance:7437
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

### AGiXT Integration

This task management panel harnesses the power of AGiXT to provide AI-driven features such as smart task suggestions, prioritization, and natural language processing capabilities.

#### Setting Up AGiXT

1. Ensure you have an AGiXT instance running and accessible. You can set up AGiXT locally or use a hosted version.
2. Obtain your AGiXT API URL and API key.
3. Configure the `NEXT_PUBLIC_AGIXT_URL` in your `.env.local` file to point to your AGiXT instance.
4. Restart your development server or rebuild your Docker containers to apply the changes.

## Usage

-   **Creating Tasks**: Click the "New Task" button to add tasks. Fill in the details and use the AI-powered suggestions to break down complex tasks into manageable subtasks.
-   **Managing Tasks**: Drag and drop tasks across the Kanban board to update their status. Click on a task to view and edit details, add comments, or assign it to a team member.
-   **Utilizing AI Features**: Engage with the AI assistant to generate task ideas, suggest optimal schedules, and provide insights based on your work patterns.
-   **Keyboard Shortcuts**: Use shortcuts like `Ctrl/Cmd + N` to create a new task, `Ctrl/Cmd + K` to focus on the search bar, and `Ctrl/Cmd + V` to toggle between views for enhanced productivity.

## Testing

### Setting Up the Testing Environment

1. Install Playwright and its dependencies:

    ```bash
    npx playwright install --with-deps
    ```

### Running Tests

-   To run all tests:

    ```bash
    npm run test
    ```

-   To run tests in UI mode:

    ```bash
    npm run test:ui
    ```

-   To view the test report:

    ```bash
    npx playwright show-report
    ```

### Test Coverage

The test suite includes comprehensive tests for:

-   Authentication flows, including login and "Use without authentication" options.
-   Task management functionalities such as creating, editing, completing, and deleting tasks.

## Contributing

We welcome contributions from the community! Whether it's adding new features, fixing bugs, or improving documentation, your help is greatly appreciated. Please refer to our contributing guidelines for more information on how to get involved.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Thanks to the AGiXT team for providing a powerful AI platform that enhances this task management panel.
-   Special thanks to all contributors and users who help improve this tool with their feedback and support.
