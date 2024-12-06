// Theme toggle component for dark mode
'use client'

import { useTheme } from './providers'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed bottom-4 right-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"imary-dark transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}