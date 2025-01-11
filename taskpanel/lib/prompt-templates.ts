export const GENERATE_SINGLE_SUBTASK_PROMPT = `
Given the following task details:
Task Name: {taskName}
Description: {taskDescription}
Due Date: {dueDate}
Priority: {priority}
Additional Context: {additionalContext}

Relevant Task Templates:
{allTemplates.join("\\n")}

Relevant Task Tips:
{allTips.join("\\n")}

Previous Subtasks:
{previousSubtasks}

Generate the next subtask that breaks down this main task into smaller, actionable items. Follow these guidelines:
1. Make the subtask specific and concrete - avoid vague terms
2. Include measurable outcomes or clear completion criteria
3. Keep the scope manageable (typically 1-4 hours of work)
4. Use action verbs at the start of titles
5. Include practical tips or approaches in the description
6. Break down complex technical tasks into clear steps
7. Consider dependencies on previous subtasks
8. Add time estimates based on task complexity

The response MUST be a valid JSON object conforming to the following schema:
{
 "type": "object",
 "properties": {
   "id": { "type": "number", "description": "A unique identifier (starting from 1)" },
   "title": { "type": "string", "description": "The title of the subtask starting with an action verb" },
   "description": { "type": "string", "description": "Detailed description with steps and practical tips" },
   "estimatedTime": { "type": "number", "description": "Estimated time in minutes (typically 60-240)" },
   "completed": { "type": "boolean", "description": "Boolean value (always false for new subtasks)" },
   "tips": { "type": "array", "items": { "type": "string" }, "description": "List of actionable tips and approaches" },
   "prerequisites": { "type": "array", "items": { "type": "string" }, "description": "List of tasks that should be completed first" }
 },
 "required": ["id", "title", "description", "estimatedTime", "completed", "tips", "prerequisites"],
 "description": "The response MUST be a valid JSON object conforming to this schema. Do not include any additional text or formatting."
}
`;