"use client";

import React, { useState } from 'react';
import { Task } from '../types/task';

interface RuleFormProps {
  onSubmit: (rule: {
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
  }) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [conditionField, setConditionField] = useState<keyof Task>('status');
  const [conditionOperator, setConditionOperator] = useState<'equals' | 'contains' | 'greater_than' | 'less_than'>('equals');
  const [conditionValue, setConditionValue] = useState('');
  const [actionType, setActionType] = useState<'update_status' | 'update_priority' | 'assign_to' | 'add_tag'>('update_status');
  const [actionValue, setActionValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      condition: {
        field: conditionField,
        operator: conditionOperator,
        value: conditionValue,
      },
      action: {
        type: actionType,
        value: actionValue,
      },
    });
  };

  const taskFields: { value: keyof Task; label: string }[] = [
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'progress', label: 'Progress' },
    { value: 'dueDate', label: 'Due Date' },
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
  ];

  const actionTypes = [
    { value: 'update_status', label: 'Update Status' },
    { value: 'update_priority', label: 'Update Priority' },
    { value: 'assign_to', label: 'Assign To' },
    { value: 'add_tag', label: 'Add Tag' },
  ];

  const renderValueInput = () => {
    switch (conditionField) {
      case 'status':
        return (
          <select
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        );
      case 'priority':
        return (
          <select
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        );
      case 'progress':
        return (
          <input
            type="number"
            min="0"
            max="100"
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter progress value (0-100)"
          />
        );
      case 'dueDate':
        return (
          <input
            type="datetime-local"
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter value"
          />
        );
    }
  };

  const renderActionValueInput = () => {
    switch (actionType) {
      case 'update_status':
        return (
          <select
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        );
      case 'update_priority':
        return (
          <select
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Rule Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter rule name"
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Condition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Field
            </label>
            <select
              value={conditionField}
              onChange={(e) => setConditionField(e.target.value as keyof Task)}
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {taskFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Operator
            </label>
            <select
              value={conditionOperator}
              onChange={(e) => setConditionOperator(e.target.value as typeof conditionOperator)}
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Value
            </label>
            {renderValueInput()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as typeof actionType)}
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Value
            </label>
            {renderActionValueInput()}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Save Rule
        </button>
      </div>
    </form>
  );
};

export default RuleForm;
