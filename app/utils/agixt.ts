import AGiXT from 'agixt';

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

interface Task {
  id: number;
  text: string;
  description?: string;
  note?: string;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
  repo?: string;
  status?: 'Pending' | 'Running' | 'Completed' | 'Failed';
  subtasks: Task[];
  dependencies?: number[];
  recurrence?: string;
  completed: boolean;
  group: string;
  conversationId?: string;
  conversationLog?: { role: string; message: string }[];
}

const createCheckpoint = async (
        taskId: string,
        checkpointData: any,
        backendUrl: string,
        authToken: string
      ) =>{
        try {
          const agixt = await initializeAGiXT(backendUrl, authToken);
          if (!agixt) {
            throw new Error("Failed to initialize AGiXT");
          }

          // Assuming AGiXT has a method to store custom data
          await agixt.createTaskCheckpoint(taskId, checkpointData);

          const checkpoint = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            title: "Checkpoint",
            completed: false,
            state: checkpointData,
          };

          console.log("Checkpoint created:", checkpoint);
          return checkpoint;
        } catch (error) {
          console.error("Error creating checkpoint:", error);
          return null;
        }
      };

      const loadCheckpoint = async (
        taskId: string,
        checkpointId: string,
        backendUrl: string,
        authToken: string
      ) =>{
        try {
          const agixt = await initializeAGiXT(backendUrl, authToken);
          if (!agixt) {
            throw new Error("Failed to initialize AGiXT");
          }

          // Assuming AGiXT has a method to retrieve custom data
          const checkpointData = await agixt.getTaskCheckpoint(
            taskId,
            checkpointId
          );

          console.log("Checkpoint loaded:", checkpointData);
          return checkpointData;
        } catch (error) {
          console.error("Error loading checkpoint:", error);
          return null;
        }
      };

const createCheckpoint = async (
        taskId: string,
        checkpointData: any,
        backendUrl: string,
        authToken: string
      ) =>{
        try {
          const agixt = await initializeAGiXT(backendUrl, authToken);
          if (!agixt) {
            throw new Error("Failed to initialize AGiXT");
          }

          // Assuming AGiXT has a method to store custom data
          await agixt.createTaskCheckpoint(taskId, checkpointData);

          const checkpoint = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            title: "Checkpoint",
            completed: false,
            state: checkpointData,
          };

          console.log("Checkpoint created:", checkpoint);
          return checkpoint;
        } catch (error) {
          console.error("Error creating checkpoint:", error);
          return null;
        }
      };

      const loadCheckpoint = async (
        taskId: string,
        checkpointId: string,
        backendUrl: string,
        authToken: string
      ) =>{
        try {
          const agixt = await initializeAGiXT(backendUrl, authToken);
          if (!agixt) {
            throw new Error("Failed to initialize AGiXT");
          }

          // Assuming AGiXT has a method to retrieve custom data
          const checkpointData = await agixt.getTaskCheckpoint(
            taskId,
            checkpointId
          );

          console.log("Checkpoint loaded:", checkpointData);
          return checkpointData;
        } catch (error) {
          console.error("Error loading checkpoint:", error);
          return null;
        }
      };

const parseSubtasks = (result: string): Task[] => {
  try {
    // Find the start and end of the JSON array within the response
    const startIndex = result.indexOf('```\n[') + 4; // +4 to skip "```\n["
    const endIndex = result.lastIndexOf(']\n```');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not find JSON array in the response');
    }

    // Extract the JSON string
    const jsonString = result.substring(startIndex, endIndex + 1);

    // Parse the JSON string
    const parsedResult = JSON.parse(jsonString);

    if (!Array.isArray(parsedResult)) {
      throw new Error('Parsed result is not an array');
    }

    return parsedResult.map(subtask => ({
      id: Date.now() + Math.random(), // Generate a unique id
      text: subtask.text,
      completed: false,
      group: 'Default',
      subtasks: []
    }));
  } catch (error) {
    console.error('Error parsing subtasks:', error);
    return [];
  }

const handleRunChain = async (task: any, selectedAgent: string, backendUrl: string, authToken: string) =>{
    if (!selectedAgent) {
      return;
    }

    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        return;
      }
      const conversationName = task.conversationId || `Chain_${task.id}`;
      if (!task.conversationId) {
        await agixt.newConversation(selectedAgent, conversationName);
        task.conversationId = conversationName;
      }

const result = await agixt.runChain(
        'Task Management',
        task.text,
        selectedAgent,
        false,
        1,
        {
          conversation_name: conversationName,
        }
      );

      // Create a checkpoint after each step in the chain
      const checkpoint = await createCheckpoint(
        task.id,
        {
          chainStep: result, // Assuming result contains relevant data
          agentState: {}, // Replace with actual agent state if available
        },
        backendUrl,
        authToken
      );

      if (checkpoint) {
        task.checkpoints = [...(task.checkpoints || []), checkpoint];
      }

      const updatedTask = { ...task, status: 'Running' as const };
      return updatedTask;
    } catch (error) {
      console.error('Error running chain:', error);
      const updatedTask = { ...task, status: 'Failed' as const };
      return updatedTask;
    }
  };


const initializeAGiXT = async (backendUrl: string, authToken: string) => {
  try {
    const agixt = new AGiXT({
      apiKey: authToken,
      baseUri: backendUrl,
    });
    return agixt;
  } catch (error) {
    console.error("Error initializing AGiXT SDK:", error);
    return null;
  }
};

const getAgents = async (backendUrl: string, authToken: string) => {
    if (!backendUrl || !authToken) {
      console.error("AGiXT backend URL or auth token is missing");
      return;
    }
  
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        return;
      }
      const agentList = await agixt.getAgents();
      let formattedAgents: { name: string }[] = [];
      if (Array.isArray(agentList)) {
        formattedAgents = agentList.map(agent => ({ name: typeof agent === 'string' ? agent : agent.name }));
      } else if (typeof agentList === 'object' && agentList !== null) {
        formattedAgents = Object.keys(agentList).map(name => ({ name }));
      } else {
        throw new Error("Unexpected agent list format");
      }
      return formattedAgents;
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  };

// Create an initial checkpoint after generating subtasks
      const initialCheckpoint = await createCheckpoint(
        task.id,
        {
          subtasks: subtasks,
          agentState: {}, // Replace with actual agent state if available
        },
        backendUrl,
        authToken,
      );

      if (initialCheckpoint) {
        updatedTask.checkpoints = [initialCheckpoint];
      }

const createCheckpoint = async (
    taskId: string,
    checkpointData: any,
    backendUrl: string,
    authToken: string,
  ) =>{
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error("Failed to initialize AGiXT");
      }

      // Assuming AGiXT has a method to store custom data
      await agixt.createTaskCheckpoint(taskId, checkpointData);

      const checkpoint = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        state: checkpointData,
      };

      console.log("Checkpoint created:", checkpoint);
      return checkpoint;
    } catch (error) {
      console.error("Error creating checkpoint:", error);
      return null;
    }
  };

  const loadCheckpoint = async (
    taskId: string,
    checkpointId: string,
    backendUrl: string,
    authToken: string,
  ) =>{
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error("Failed to initialize AGiXT");
      }

      // Assuming AGiXT has a method to retrieve custom data
      const checkpointData = await agixt.getTaskCheckpoint(
        taskId,
        checkpointId,
      );

      console.log("Checkpoint loaded:", checkpointData);
      return checkpointData;
    } catch (error) {
      console.error("Error loading checkpoint:", error);
      return null;
    }
  };

const handleGenerateSubtasks = async (task: any, selectedAgent: string, backendUrl: string, authToken: string) =>{
    if (!selectedAgent) {
      return;
    }

    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        return;
      }
      const conversationName = `Subtasks_${task.id}`;
      await agixt.newConversation(selectedAgent, conversationName);
      task.conversationId = conversationName;

      const GENERATE_SUBTASKS_PROMPT = `Given the following task details:
Task Name: {taskName}
Description: {taskDescription}
Due Date: {dueDate}
Priority: {priority}
Additional Context: {additionalContext}

Generate a list of 3-5 subtasks that break down this main task into smaller, actionable items. Each subtask should be specific, measurable, and contribute to the completion of the main task.

Format the response as a JSON array of objects, where each object has the following properties:
- id: A unique identifier (you can use numbers starting from 1)
- text: The description of the subtask
- completed: Boolean value (set to false for new subtasks)

Example format:
[
  {
    "id": 1,
    "text": "Subtask description here",
    "completed": false
  },
  ...
]
`;

      const userInput = GENERATE_SUBTASKS_PROMPT
        .replace('{taskName}', task.title)
        .replace('{taskDescription}', task.description || '')
        .replace('{dueDate}', task.dueDate ? task.dueDate.toISOString() : '')
        .replace('{priority}', task.priority || '')
        .replace('{additionalContext}', '');

      const result = await agixt.prompt(
        selectedAgent,
        userInput,
        conversationName
      );

const subtasks = parseSubtasks(result);

      // Create an initial checkpoint after generating subtasks
      const initialCheckpoint = await createCheckpoint(
        task.id,
        {
          subtasks: subtasks,
          agentState: {}, // Replace with actual agent state if available
        },
        backendUrl,
        authToken,
      );

      if (initialCheckpoint) {
        updatedTask.checkpoints = [initialCheckpoint];
      }

      const updatedTask = {
        ...task,
        subtasks: subtasks,
        status: 'in-progress' as const,
        checkpoints: initialCheckpoint ? [initialCheckpoint] : [],
        progress: 0,
      };

      return updatedTask;
    } catch (error) {
      console.error("Error generating subtasks:", error);
    }
  };
      const updatedTask = {
        ...task,
        subtasks: subtasks,
        status: 'in-progress' as const,
        checkpoints: initialCheckpoint ? [initialCheckpoint] : [],
      };

      return updatedTask;
    } catch (error) {
      console.error("Error generating subtasks:", error);
    }
  };

  const createCheckpoint = async (
    taskId: string,
    checkpointData: any,
    backendUrl: string,
    authToken: string,
  ) =>{
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error("Failed to initialize AGiXT");
      }

      // Assuming AGiXT has a method to store custom data
      await agixt.createTaskCheckpoint(taskId, checkpointData);

      const checkpoint = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        state: checkpointData,
      };

      console.log("Checkpoint created:", checkpoint);
      return checkpoint;
    } catch (error) {
      console.error("Error creating checkpoint:", error);
      return null;
    }
  };

  const loadCheckpoint = async (
    taskId: string,
    checkpointId: string,
    backendUrl: string,
    authToken: string,
  ) =>{
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error("Failed to initialize AGiXT");
      }

      // Assuming AGiXT has a method to retrieve custom data
      const checkpointData = await agixt.getTaskCheckpoint(
        taskId,
        checkpointId,
      );

      console.log("Checkpoint loaded:", checkpointData);
      return checkpointData;
    } catch (error) {
      console.error("Error loading checkpoint:", error);
      return null;
    }
  };

const createCheckpoint = async (
    taskId: string,
    checkpointData: any,
    backendUrl: string,
    authToken: string,
  ) =>{
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error("Failed to initialize AGiXT");
      }

      // Assuming AGiXT has a method to store custom data
      await agixt.createTaskCheckpoint(taskId, checkpointData);

      const checkpoint = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        title: "Checkpoint",
        completed: false,
        state: checkpointData,
      };

      console.log("Checkpoint created:", checkpoint);
      return checkpoint;
    } catch (error) {
        if (error instanceof Error) {
          console.error("Error creating checkpoint:", error.message);
          alert('Failed to create checkpoint: ' + error.message);
        } else {
          console.error("Unknown error creating checkpoint:", error);
          alert('An unknown error occurred while creating the checkpoint.');
        }
      return null;
    }
  };

  const loadCheckpoint = async (
    taskId: string,
    checkpointId: string,
    backendUrl: string,
    authToken: string,
  ) =>{
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error("Failed to initialize AGiXT");
      }

      // Assuming AGiXT has a method to retrieve custom data
      const checkpointData = await agixt.getTaskCheckpoint(
        taskId,
        checkpointId,
      );

      console.log("Checkpoint loaded:", checkpointData);
      return checkpointData;
    } catch (error) {
        if (error instanceof Error) {
          console.error("Error loading checkpoint:", error.message);
          alert('Failed to load checkpoint: ' + error.message);
        } else {
          console.error("Unknown error loading checkpoint:", error);
          alert('An unknown error occurred while loading the checkpoint.');
        }
      return null;
    }
  };

  const handleRunChain = async (
    task: any,
    selectedAgent: string,
    backendUrl: string,
    authToken: string,
  ) =>{
    if (!selectedAgent) {
      return;
    }

    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        return;
      }
      const conversationName = task.conversationId || `Chain_${task.id}`;
      if (!task.conversationId) {
        await agixt.newConversation(selectedAgent, conversationName);
        task.conversationId = conversationName;
      }

      const result = await agixt.runChain(
        "Task Management",
        task.text,
        selectedAgent,
        false,
        1,
        {
          conversation_name: conversationName,
        },
      );

      // Create a checkpoint after each step in the chain
      const checkpoint = await createCheckpoint(
        task.id,
        {
          chainStep: result, // Assuming result contains relevant data
          agentState: {}, // Replace with actual agent state if available
        },
        backendUrl,
        authToken,
      );

      if (checkpoint) {
        task.checkpoints = [...(task.checkpoints || []), checkpoint];
      }

      const updatedTask = { ...task, status: "Running" as const };
      return updatedTask;
    } catch (error) {
      console.error("Error running chain:", error);
      const updatedTask = { ...task, status: "Failed" as const };
      return updatedTask;
    }
  };

  export { initializeAGiXT, getAgents, handleGenerateSubtasks, handleRunChain, updateConversationLog, parseSubtasks, createCheckpoint, loadCheckpoint };

      if (initialCheckpoint) {
        updatedTask.checkpoints = [initialCheckpoint];
      }

      return updatedTask;
    } catch (error) {
      console.error("Error generating subtasks:", error);
    }
  };

  const handleRunChain = async (task: any, selectedAgent: string, backendUrl: string, authToken: string) => {
    if (!selectedAgent) {
      return;
    }
  
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        return;
      }
      const conversationName = task.conversationId || `Chain_${task.id}`;
      if (!task.conversationId) {
        await agixt.newConversation(selectedAgent, conversationName);
        task.conversationId = conversationName;
      }
  
      const result = await agixt.runChain(
        'Task Management',
        task.text,
        selectedAgent,
        false,
        1,
        {
          conversation_name: conversationName,
        }
      );
  
      const updatedTask = { ...task, status: 'Running' as const };
      return updatedTask;
    } catch (error) {
      console.error('Error running chain:', error);
      const updatedTask = { ...task, status: 'Failed' as const };
      return updatedTask;
    }
  };

  const updateConversationLog = (
    task: Task,
    role: string,
    message: string
  ) => {
    const updatedTask = {
      ...task,
      conversationLog: [...(task.conversationLog || []), { role, message }],
    };
    return updatedTask;
  };

const createCheckpoint = async (
  taskId: string,
  checkpointData: any,
  backendUrl: string,
  authToken: string,
) =>{
  try {
    const agixt = await initializeAGiXT(backendUrl, authToken);
    if (!agixt) {
      throw new Error("Failed to initialize AGiXT");
    }

    // Assuming AGiXT has a method to store custom data
    await agixt.createTaskCheckpoint(taskId, checkpointData);

    const checkpoint = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      state: checkpointData,
    };

    console.log("Checkpoint created:", checkpoint);
    return checkpoint;
  } catch (error) {
    console.error("Error creating checkpoint:", error);
    return null;
  }
};

const loadCheckpoint = async (
  taskId: string,
  checkpointId: string,
  backendUrl: string,
  authToken: string,
) =>{
  try {
    const agixt = await initializeAGiXT(backendUrl, authToken);
    if (!agixt) {
      throw new Error("Failed to initialize AGiXT");
    }

    // Assuming AGiXT has a method to retrieve custom data
    const checkpointData = await agixt.getTaskCheckpoint(
      taskId,
      checkpointId,
    );

    console.log("Checkpoint loaded:", checkpointData);
    return checkpointData;
  } catch (error) {
    console.error("Error loading checkpoint:", error);
    return null;
  }
};

const handleRunChain = async (
  task: any,
  selectedAgent: string,
  backendUrl: string,
  authToken: string,
) =>{
  if (!selectedAgent) {
    return;
  }

  try {
    const agixt = await initializeAGiXT(backendUrl, authToken);
    if (!agixt) {
      return;
    }
    const conversationName = task.conversationId || `Chain_${task.id}`;
    if (!task.conversationId) {
      await agixt.newConversation(selectedAgent, conversationName);
      task.conversationId = conversationName;
    }

    const result = await agixt.runChain(
      "Task Management",
      task.text,
      selectedAgent,
      false,
      1,
      {
        conversation_name: conversationName,
      },
    );

    // Create a checkpoint after each step in the chain
    const checkpoint = await createCheckpoint(
      task.id,
      {
        chainStep: result, // Assuming result contains relevant data
        agentState: {}, // Replace with actual agent state if available
      },
      backendUrl,
      authToken,
    );

    if (checkpoint) {
      task.checkpoints = [...(task.checkpoints || []), checkpoint];
    }

    const updatedTask = { ...task, status: "Running" as const };
    return updatedTask;
  } catch (error) {
    console.error("Error running chain:", error);
    const updatedTask = { ...task, status: "Failed" as const };
    return updatedTask;
  }
};

export { initializeAGiXT, getAgents, handleGenerateSubtasks, handleRunChain, updateConversationLog, parseSubtasks };
