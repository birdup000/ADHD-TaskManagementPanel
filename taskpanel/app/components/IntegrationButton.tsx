"use client";

import React from 'react';

interface IntegrationButtonProps {
  type: 'google' | 'slack' | 'notion';
  onClick: () => void;
}

const IntegrationButton: React.FC<IntegrationButtonProps> = ({ type, onClick }) => {
  const integrations = {
    notion: {
      icon: '📝',
      text: 'Connect Notion',
      description: 'Sync notes with Notion'
    },
    google: {
      icon: '📅',
      text: 'Connect Google Calendar',
      description: 'Sync tasks with Google Calendar'
    },
    slack: {
      icon: '💬',
      text: 'Connect Slack',
      description: 'Get notifications and updates in Slack'
    }
  };

  const { icon, text, description } = integrations[type];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-4 bg-[#333333] rounded-lg hover:bg-[#383838] transition-colors"
    >
      <span className="text-2xl mr-4">{icon}</span>
      <div className="text-left">
        <div className="font-medium">{text}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
    </button>
  );
};

export default IntegrationButton;