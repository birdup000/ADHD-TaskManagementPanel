import AGiXTSDK from 'agixt';

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
};


const initializeAGiXT = async (agixtApiUri: string, agixtApiKey: string) => {
  try {
    const agixt = new AGiXTSDK({
      baseUri: agixtApiUri,
      apiKey: agixtApiKey,
    });
    return agixt;
  } catch (error) {
    console.error("Error initializing AGiXT SDK:", error);
    return null;
  }
};

const getAgents = async (agixtApiUri: string, agixtApiKey: string) => {
    if (!agixtApiUri || !agixtApiKey) {
      console.error("AGiXT API URI or API Key is missing");
      return;
    }
  
    try {
      const agixt = await initializeAGiXT(agixtApiUri, agixtApiKey);
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

  const handleGenerateSubtasks = async (task: Task, selectedAgent: string, agixtApiUri: string, agixtApiKey: string) => {
    if (!selectedAgent) {
      return;
    }
  
    try {
      const agixt = await initializeAGiXT(agixtApiUri, agixtApiKey);
      if (!agixt) {
        return;
      }
      const conversationName = `Subtasks_${task.id}`;
      const conversation = await agixt.newConversation(
        selectedAgent,
        conversationName
      );
      task.conversationId = conversationName;
  
      const GENERATE_SUBTASKS_PROMPT = `
      Given the following task details:
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
        .replace('{taskName}', task.text)
        .replace('{taskDescription}', task.description || '')
        .replace('{dueDate}', task.dueDate || '')
        .replace('{priority}', task.priority || '')
        .replace('{additionalContext}', '');
  
      const result = await agixt.chat(
        selectedAgent,
        userInput,
        conversationName,
        4
      );
  
      const subtasks = parseSubtasks(result);
      const updatedTask = {
        ...task,
        subtasks: subtasks,
        status: 'Pending' as const,
      };
      return updatedTask;
    } catch (error) {
      console.error('Error generating subtasks:', error);
    }
  };

  const handleRunChain = async (task: Task, selectedAgent: string, agixtApiUri: string, agixtApiKey: string) => {
    if (!selectedAgent) {
      return;
    }
  
    try {
      const agixt = await initializeAGiXT(agixtApiUri, agixtApiKey);
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

export { initializeAGiXT, getAgents, handleGenerateSubtasks, handleRunChain, updateConversationLog, parseSubtasks };
