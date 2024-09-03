# ADHD Task (Mirror Repo)

The ADHD Task is a React Native application designed to help individuals with Attention Deficit Hyperactivity Disorder (ADHD) manage their tasks and stay organized. ADHD can make it challenging to maintain focus, prioritize tasks, and keep track of deadlines. This app aims to address these challenges by providing a user-friendly and ADHD-friendly interface to help users stay on top of their responsibilities.

## Mission

The mission of the ADHD Task Panel is to empower individuals with ADHD to regain control over their tasks and improve their productivity. ADHD can make it difficult to stay organized and focused, leading to missed deadlines, forgotten tasks, and a sense of constant overwhelm. The ADHD Task Panel aims to alleviate these challenges by providing a visually appealing, distraction-free environment where users can easily create, edit, and track their tasks.

The app's features, such as the ability to associate tasks with GitHub repositories, visual cues for past-due tasks, and the ability to manage subtasks, are designed to cater to the unique needs of individuals with ADHD. By providing a structured and intuitive task management system, the ADHD Task Panel empowers users to regain control over their workload, reduce stress, and improve their overall well-being.

## Features

- Create new tasks with a title, note, due date, priority, and repository
- View a list of all tasks
- Edit existing tasks, including updating the title, note, due date, priority, and repository
- Add and manage subtasks for each task
- Visually indicate past due tasks
- Integrate with GitHub repositories to associate tasks with specific repositories
- Designed with ADHD-friendly features to improve focus and productivity

## Prerequisites

- Node.js and npm installed
- React Native CLI installed
- Expo CLI installed
- A GitHub account and API key

## Installation

1. Clone the repository:

```
git clone https://github.com/birdup000/ADHD-TaskManagementPanel
```

2. Navigate to the repo directory

```
cd ADHD-TaskManagementPanel
```

3. Navigate to the repo directory

```
cd adhdpanel
```

4. Install the dependencies:

```
npm install
```

4. Start the development server:

```
expo start
```

## Configuration

1. Set up your GitHub API key:
   - Go to the GitHub Developer Settings and generate a new personal access token.
   - Save the token in your device's AsyncStorage using the key `authKey`.
   - Save your GitHub username in AsyncStorage using the key `githubUsername`.

## Usage

1. When you first launch the app, you'll be prompted to enter your GitHub username and API key.
2. Once you've set up your GitHub credentials, you can start managing your tasks.
3. To add a new task, enter the task text and optional priority in the input fields, then click the "Add" button.
4. To edit a task, tap on the task in the list. This will open the task edit modal, where you can update the task name, note, due date, priority, and associated repository.
5. To add a subtask, tap on the task in the list, then enter the subtask text and press Enter.
6. To edit a subtask, tap on the subtask in the list, update the text, and press Enter to save the changes.
7. To remove a task or subtask, tap on the task or subtask and then tap the delete icon.

## Dependencies

- React
- React Native
- AsyncStorage
- React Datepicker
- React Native Vector Icons
- Apollo Client
- GraphQL

## Contributing

If you find any issues or have suggestions for improvements, please feel free to open a new issue or submit a pull request.
