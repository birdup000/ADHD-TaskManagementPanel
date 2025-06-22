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
        // Background colors - semantic naming for ADHD-friendly UI
        'bg-primary': '#121212',
        'bg-secondary': '#1E1E1E',
        'bg-tertiary': '#2D2D2D',
        'bg-elevated': '#353535',
        'bg-overlay': 'rgba(0, 0, 0, 0.7)',
        
        // Accent colors with hover states
        'accent-primary': '#7B68EE',
        'accent-primaryHover': '#6A5ACD',
        'accent-primaryActive': '#5B4FCE',
        'accent-secondary': '#20B2AA',
        'accent-secondaryHover': '#1C9D96',
        'accent-muted': 'rgba(123, 104, 238, 0.1)',
        'accent-focus': 'rgba(123, 104, 238, 0.3)',
        
        // Text hierarchy
        'text-primary': '#E0E0E0',
        'text-secondary': 'rgba(224, 224, 224, 0.7)',
        'text-tertiary': 'rgba(224, 224, 224, 0.5)',
        'text-inverse': '#121212',
        'text-onAccent': '#FFFFFF',
        
        // Priority system with backgrounds
        'priority-high': '#FF5252',
        'priority-highBg': 'rgba(255, 82, 82, 0.1)',
        'priority-medium': '#FFB300',
        'priority-mediumBg': 'rgba(255, 179, 0, 0.1)',
        'priority-low': '#4CAF50',
        'priority-lowBg': 'rgba(76, 175, 80, 0.1)',
        'priority-completed': '#757575',
        'priority-completedBg': 'rgba(117, 117, 117, 0.1)',
        
        // Status colors
        'status-success': '#4CAF50',
        'status-successBg': 'rgba(76, 175, 80, 0.1)',
        'status-warning': '#FFB300',
        'status-warningBg': 'rgba(255, 179, 0, 0.1)',
        'status-error': '#FF5252',
        'status-errorBg': 'rgba(255, 82, 82, 0.1)',
        'status-info': '#20B2AA',
        'status-infoBg': 'rgba(32, 178, 170, 0.1)',
        
        // Border system
        'border-default': '#2D2D2D',
        'border-light': '#404040',
        'border-heavy': '#1A1A1A',
        'border-accent': '#7B68EE',
        
        // Legacy support
        'hover': 'rgba(123, 104, 238, 0.1)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
      },
      width: {
        'panel-left': '20%',
        'panel-main': '50%',
        'panel-right': '30%'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      lineHeight: {
        tight: '1.25',
        relaxed: '1.75',
        loose: '2'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'outline-accent': '0 0 0 2px rgba(123, 104, 238, 0.3)',
        'glow': '0 0 20px rgba(123, 104, 238, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-in': 'slideIn 300ms ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    },
  },
  plugins: [],
} satisfies Config;
