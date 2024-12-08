'use client'

import React from 'react'
import { useTheme } from './providers'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      suppressHydrationWarning
      className="fixed bottom-4 right-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
      aria-label="Toggle theme"
    >
      <span suppressHydrationWarning>
        {theme === 'dark' ? '🌞' : '🌙'}
      </span>
    </button>
  )
}