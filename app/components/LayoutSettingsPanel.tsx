import React from 'react';

export interface LayoutSettings {
  selectedLayout: 'board' | 'matrix' | 'list' | 'calendar';
  columnVisibility: {
    title: boolean;
    description: boolean;
    dueDate: boolean;
    priority: boolean;
    tags: boolean;
    assignees: boolean;
    subtasks: boolean;
    status: boolean;
  };
}

interface LayoutSettingsPanelProps {
  layoutSettings: LayoutSettings;
  onSave: (newSettings: LayoutSettings) => void; // Updated type
  onClose: () => void;
}

const LayoutSettingsPanel: React.FC<LayoutSettingsPanelProps> = ({ layoutSettings, onSave, onClose }) => {
  const handleSave = () => {
    // Logic to save settings
    onSave(layoutSettings);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-lg font-bold">Layout Settings</h2>
      {/* Add form elements here */}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default LayoutSettingsPanel;
