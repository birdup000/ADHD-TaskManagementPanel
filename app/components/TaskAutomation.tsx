"use client";

import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import RuleForm from './RuleForm';

interface AutomationRule {
  id: string;
  name: string;
  condition: {
    field: keyof Task;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  action: {
    type: 'update_status' | 'update_priority' | 'assign_to' | 'add_tag';
    value: any;
  };
  enabled: boolean;
}

interface TaskAutomationProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const defaultRules: AutomationRule[] = [
  {
    id: '1',
    name: 'High Priority for Overdue Tasks',
    condition: {
      field: 'dueDate',
      operator: 'less_than',
      value: new Date(),
    },
    action: {
      type: 'update_priority',
      value: 'high',
    },
    enabled: true,
  },
  {
    id: '2',
    name: 'Auto-assign In Progress',
    condition: {
      field: 'progress',
      operator: 'greater_than',
      value: 0,
    },
    action: {
      type: 'update_status',
      value: 'in-progress',
    },
    enabled: true,
  },
];

const TaskAutomation: React.FC<TaskAutomationProps> = ({
  tasks,
  onUpdateTask,
  className = '',
}) => {
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const evaluateCondition = (task: Task, condition: AutomationRule['condition']) => {
    const taskValue = task[condition.field];

    // Handle undefined values
    if (taskValue === undefined) {
      return false;
    }

    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return taskValue === conditionValue;
      case 'contains':
        if (Array.isArray(taskValue)) {
          return taskValue.includes(conditionValue);
        }
        return String(taskValue).includes(String(conditionValue));
      case 'greater_than':
        if (condition.field === 'dueDate') {
          const taskDate = taskValue instanceof Date ? taskValue : new Date(taskValue as string);
          const compareDate = conditionValue instanceof Date ? conditionValue : new Date(conditionValue);
          return taskDate > compareDate;
        }
        return Number(taskValue) > Number(conditionValue);
      case 'less_than':
        if (condition.field === 'dueDate') {
          const taskDate = taskValue instanceof Date ? taskValue : new Date(taskValue as string);
          const compareDate = conditionValue instanceof Date ? conditionValue : new Date(conditionValue);
          return taskDate < compareDate;
        }
        return Number(taskValue) < Number(conditionValue);
      default:
        return false;
    }
  };

  const applyAction = (task: Task, action: AutomationRule['action']): Task => {
    const updatedTask = { ...task };

    switch (action.type) {
      case 'update_status':
        updatedTask.status = action.value as Task['status'];
        break;
      case 'update_priority':
        updatedTask.priority = action.value as Task['priority'];
        break;
      case 'assign_to':
        updatedTask.assignees = [...(updatedTask.assignees || []), action.value];
        break;
      case 'add_tag':
        updatedTask.tags = [...(updatedTask.tags || []), action.value];
        break;
    }

    return updatedTask;
  };

  const processAutomationRules = () => {
    const enabledRules = rules.filter(rule => rule.enabled);
    
    tasks.forEach(task => {
      let updatedTask = { ...task };
      let wasUpdated = false;

      enabledRules.forEach(rule => {
        if (evaluateCondition(updatedTask, rule.condition)) {
          const newTask = applyAction(updatedTask, rule.action);
          if (JSON.stringify(newTask) !== JSON.stringify(updatedTask)) {
            updatedTask = newTask;
            wasUpdated = true;
          }
        }
      });

      if (wasUpdated) {
        onUpdateTask(updatedTask);
      }
    });
  };

  useEffect(() => {
    processAutomationRules();
  }, [tasks, rules]);

  const handleToggleRule = (ruleId: string) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsAddingRule(true);
  };

  const handleSaveRule = (ruleData: Omit<AutomationRule, 'id' | 'enabled'>) => {
    if (editingRule) {
      setRules(prevRules =>
        prevRules.map(rule =>
          rule.id === editingRule.id
            ? { ...rule, ...ruleData }
            : rule
        )
      );
    } else {
      const newRule: AutomationRule = {
        id: Date.now().toString(),
        ...ruleData,
        enabled: true,
      };
      setRules(prevRules => [...prevRules, newRule]);
    }
    setIsAddingRule(false);
    setEditingRule(null);
  };

  const formatConditionValue = (condition: AutomationRule['condition']) => {
    if (condition.field === 'dueDate') {
      return new Date(condition.value).toLocaleDateString();
    }
    return condition.value;
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Task Automation</h2>
        <button
          onClick={() => setIsAddingRule(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Add Rule
        </button>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div
            key={rule.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center justify-between group"
          >
            <div className="flex-1">
              <div className="font-medium">{rule.name}</div>
              <div className="text-sm text-gray-400 mt-1">
                When {rule.condition.field} {rule.condition.operator.replace('_', ' ')}{' '}
                {formatConditionValue(rule.condition)},
                {' '}{rule.action.type.replace('_', ' ')} to {rule.action.value}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleEditRule(rule)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleRule(rule.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  rule.enabled
                    ? 'bg-green-900/50 text-green-200'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="text-gray-400 hover:text-red-400"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No automation rules configured. Add a rule to get started.
          </div>
        )}
      </div>

      {isAddingRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl mx-4">
            <h3 className="text-lg font-medium mb-4">
              {editingRule ? 'Edit Rule' : 'Add Automation Rule'}
            </h3>
            <RuleForm
              onSubmit={handleSaveRule}
              onCancel={() => {
                setIsAddingRule(false);
                setEditingRule(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAutomation;
