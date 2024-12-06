// Theme settings dropdown component
'use client'

import { useTheme } from '../providers'
import { useState, useRef, useEffect } from 'react'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="fixed top-4 right-4" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-background hover:bg-muted transition-colors duration-200"
        aria-label="Theme settings"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover border border-border animate-in fade-in-0 zoom-in-95">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                theme === 'light' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => setTheme('light')}
              role="menuitem"
            >
              Light
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                theme === 'dark' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => setTheme('dark')}
              role="menuitem"
            >
              Dark
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                theme === 'system' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => setTheme('system')}
              role="menuitem"
            >
              System
            </button>
          </div>
        </div>
      )}
    </div>
  )
}