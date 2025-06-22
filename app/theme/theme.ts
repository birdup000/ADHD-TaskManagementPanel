export const theme = {
  colors: {
    // Semantic background colors for ADHD-friendly UI
    background: {
      primary: '#121212',        // Main app background
      secondary: '#1E1E1E',      // Panel backgrounds
      tertiary: '#2D2D2D',       // Card/input backgrounds
      elevated: '#353535',       // Elevated elements (modals, dropdowns)
      overlay: 'rgba(0, 0, 0, 0.7)' // Modal overlays
    },
    // Accent colors with accessible variants
    accent: {
      primary: '#7B68EE',        // Primary actions
      primaryHover: '#6A5ACD',   // Primary hover state
      primaryActive: '#5B4FCE',  // Primary active state
      secondary: '#20B2AA',      // Secondary actions
      secondaryHover: '#1C9D96', // Secondary hover state
      muted: 'rgba(123, 104, 238, 0.1)', // Subtle backgrounds
      focus: 'rgba(123, 104, 238, 0.3)'  // Focus rings
    },
    // Text hierarchy for clear information structure
    text: {
      primary: '#E0E0E0',        // Main content
      secondary: 'rgba(224, 224, 224, 0.7)', // Supporting content
      tertiary: 'rgba(224, 224, 224, 0.5)',  // Disabled/placeholder
      inverse: '#121212',        // Text on light backgrounds
      onAccent: '#FFFFFF'        // Text on accent colors
    },
    // Priority system with WCAG compliant contrast
    priority: {
      high: '#FF5252',           // High priority tasks
      highBg: 'rgba(255, 82, 82, 0.1)',
      medium: '#FFB300',         // Medium priority tasks
      mediumBg: 'rgba(255, 179, 0, 0.1)',
      low: '#4CAF50',           // Low priority tasks
      lowBg: 'rgba(76, 175, 80, 0.1)',
      completed: '#757575',      // Completed tasks
      completedBg: 'rgba(117, 117, 117, 0.1)'
    },
    // Semantic state colors
    status: {
      success: '#4CAF50',
      successBg: 'rgba(76, 175, 80, 0.1)',
      warning: '#FFB300',
      warningBg: 'rgba(255, 179, 0, 0.1)',
      error: '#FF5252',
      errorBg: 'rgba(255, 82, 82, 0.1)',
      info: '#20B2AA',
      infoBg: 'rgba(32, 178, 170, 0.1)'
    },
    // Border system for visual separation
    border: {
      default: '#2D2D2D',       // Standard borders
      light: '#404040',         // Lighter variant
      heavy: '#1A1A1A',         // Heavier variant for emphasis
      accent: '#7B68EE'         // Interactive elements
    }
  },
  
  // Typography scale optimized for ADHD users
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }]    // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },

  // Consistent spacing scale
  spacing: {
    // Component spacing
    component: {
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px
      md: '0.75rem',    // 12px
      lg: '1rem',       // 16px
      xl: '1.5rem',     // 24px
      '2xl': '2rem',    // 32px
      '3xl': '3rem',    // 48px
      '4xl': '4rem'     // 64px
    },
    // Layout spacing
    layout: {
      xs: '0.5rem',     // 8px
      sm: '1rem',       // 16px
      md: '1.5rem',     // 24px
      lg: '2rem',       // 32px
      xl: '3rem',       // 48px
      '2xl': '4rem',    // 64px
      '3xl': '6rem',    // 96px
      '4xl': '8rem'     // 128px
    },
    // Panel dimensions
    panel: {
      left: '20%',
      main: '50%',
      right: '30%'
    }
  },

  // Consistent border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  },

  // Shadow system for depth
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    none: '0 0 #0000'
  },

  // Component variants for consistency
  components: {
    button: {
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-base',
        xl: 'px-8 py-3 text-lg'
      },
      variants: {
        primary: 'bg-accent-primary hover:bg-accent-primaryHover text-text-onAccent',
        secondary: 'border border-border-default text-text-secondary hover:bg-accent-muted hover:text-text-primary',
        ghost: 'text-text-secondary hover:bg-accent-muted hover:text-text-primary',
        danger: 'bg-status-error hover:bg-red-600 text-text-onAccent'
      }
    },
    input: {
      base: 'bg-background-tertiary border border-border-default rounded-md px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-focus transition-colors',
      error: 'border-status-error focus:border-status-error focus:ring-red-200',
      success: 'border-status-success focus:border-status-success focus:ring-green-200'
    },
    card: {
      base: 'bg-background-secondary border border-border-default rounded-lg',
      elevated: 'bg-background-secondary border border-border-default rounded-lg shadow-md',
      interactive: 'bg-background-secondary border border-border-default rounded-lg hover:border-border-light transition-colors cursor-pointer'
    }
  },

  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Animation timings
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms'
  },

  // Z-index scale
  zIndex: {
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modal: 40,
    popover: 50,
    tooltip: 60
  }
}

// Helper functions for consistent styling
export const getTextSize = (size: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[size]
}

export const getSpacing = (size: keyof typeof theme.spacing.component) => {
  return theme.spacing.component[size]
}

export const getButtonClasses = (variant: keyof typeof theme.components.button.variants, size: keyof typeof theme.components.button.sizes = 'md') => {
  return `${theme.components.button.sizes[size]} ${theme.components.button.variants[variant]} rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-background-primary`
}