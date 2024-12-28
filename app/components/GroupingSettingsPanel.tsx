import React from 'react';

export interface GroupingSettings {
  groupBy: 'list' | 'tag' | 'project' | 'none';
}

interface GroupingSettingsPanelProps {
  groupingSettings: GroupingSettings;
  onSave: (newSettings: GroupingSettings) => void; // Updated type
  onClose: () => void;
}

const GroupingSettingsPanel: React.FC<GroupingSettingsPanelProps> = ({ groupingSettings, onSave, onClose }) => {
  const handleSave = () => {
    // Logic to save settings
    onSave(groupingSettings);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-lg font-bold">Grouping Settings</h2>
      {/* Add form elements here */}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default GroupingSettingsPanel;
