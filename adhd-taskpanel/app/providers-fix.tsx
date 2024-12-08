'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  // Memoize theme application function
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }
    
    root.classList.add(newTheme);
  }, []);

  // Memoize setTheme callback
  const setThemeCallback = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, newTheme);
    }
  }, [storageKey]);

  // Initialize theme state with proper initial value
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(storageKey) as Theme | null;
      return saved || defaultTheme;
    }
    return defaultTheme;
  });

  const value = {
    theme,
    setTheme: setThemeCallback,
  };

  // Effect to apply theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Separate effect for system theme changes
  useEffect(() => {
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

export { ThemeProviderContext }