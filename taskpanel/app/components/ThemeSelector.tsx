import React from 'react';

const themes = [
  {
    name: 'Midnight Eclipse',
    primary: '#212121',
    secondary: '#2A2A2A',
    accent: '#4F46E5'
  },
  {
    name: 'Deep Ocean',
    primary: '#1a1f2c',
    secondary: '#2a3444',
    accent: '#60a5fa'
  },
  {
    name: 'Forest Night',
    primary: '#1b1f1b',
    secondary: '#2a332a',
    accent: '#059669'
  },
  {
    name: 'Dark Violet',
    primary: '#1a1823',
    secondary: '#2a2438',
    accent: '#7c3aed'
  },
  {
    name: 'Charcoal',
    primary: '#1a1a1a',
    secondary: '#2d2d2d',
    accent: '#ef4444'
  }
];

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: typeof themes[0]) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="relative group">
      <button className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] text-white">
        Theme
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-[#2A2A2A] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {themes.map((theme) => (
          <button
            key={theme.name}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-[#333333] ${
              currentTheme === theme.name ? 'text-indigo-400' : 'text-white'
            }`}
            onClick={() => onThemeChange(theme)}
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: theme.accent }}
              />
              {theme.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;