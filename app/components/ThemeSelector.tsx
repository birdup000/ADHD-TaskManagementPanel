"use client";

import React from 'react';

import { colors } from '../../tailwind.config';

type ThemeType = typeof colors.dark;

const themes: Record<string, ThemeType> = {
  'Midnight Eclipse': {
    primary: '#212121',
    secondary: '#2A2A2A',
    tertiary: '#333333',
    hover: '#383838',
    accent: {
      indigo: '#4F46E5',
      purple: '#7C3AED',
      blue: '#2563EB',
      green: '#059669',
      red: '#DC2626',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A3A3A3',
    }
  },
  'Deep Ocean': {
    primary: '#1a1f2c',
    secondary: '#2a3444',
    tertiary: '#3a4964',
    hover: '#4a5974',
    accent: {
      indigo: '#4F46E5',
      purple: '#7C3AED',
      blue: '#60a5fa',
      green: '#059669',
      red: '#DC2626',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A3A3A3',
    }
  }
};

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const currentThemeName = Object.entries(themes).find(
    ([_, theme]) => theme.primary === currentTheme.primary
  )?.[0] || 'Midnight Eclipse';
  return (
    <div className="relative group">
      <button className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] text-white">
        Theme
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-[#2A2A2A] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {Object.entries(themes).map(([name, theme]) => (
          <button
            key={name}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-[#333333] ${
              currentThemeName === name ? 'text-indigo-400' : 'text-white'
            }`}
            onClick={() => onThemeChange(theme)}
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: theme.accent.indigo }}
              />
              {name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
