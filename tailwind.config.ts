import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#121212',
        'bg-secondary': '#1E1E1E',
        'bg-tertiary': '#2D2D2D',
        
        // Accent colors
        'accent-primary': '#7B68EE',
        'accent-secondary': '#20B2AA',
        
        // Text colors
        'text-primary': '#E0E0E0',
        'text-secondary': 'rgba(224, 224, 224, 0.7)',
        
        // Priority colors
        'priority-high': '#FF5252',
        'priority-medium': '#FFB300',
        'priority-low': '#4CAF50',
        'priority-completed': '#757575',
        
        // Border colors
        'border-default': '#2D2D2D',
        'hover': 'rgba(123, 104, 238, 0.1)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px'
      },
      width: {
        'panel-left': '20%',
        'panel-main': '50%',
        'panel-right': '30%'
      },
      lineHeight: {
        relaxed: '1.75'
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    },
  },
  plugins: [],
} satisfies Config;
