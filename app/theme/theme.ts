// Define the base theme structure
const baseTheme = {
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
      primaryHover: '#5C4CB0',   // Primary hover state with increased contrast
      primaryActive: '#4D3FA0',  // Primary active state with increased contrast
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
      xs: ['0.75rem', { lineHeight: '1.2rem' }],     // 12px, line height adjusted for readability
      sm: ['0.875rem', { lineHeight: '1.4rem' }],    // 14px, line height adjusted for readability
      base: ['1rem', { lineHeight: '1.6rem' }],      // 16px, line height adjusted for readability
      lg: ['1.125rem', { lineHeight: '1.8rem' }],    // 18px, line height adjusted for readability
      xl: ['1.25rem', { lineHeight: '2rem' }],       // 20px, line height adjusted for readability
      '2xl': ['1.5rem', { lineHeight: '2.4rem' }],   // 24px, line height adjusted for readability
      '3xl': ['1.875rem', { lineHeight: '3rem' }],   // 30px, line height adjusted for readability
      '4xl': ['2.25rem', { lineHeight: '3.6rem' }]   // 36px, line height adjusted for readability
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
      // Responsive panel widths for different breakpoints
      left: {
        base: '20%',   // Default for larger screens
        md: '25%',     // Adjust for medium screens
        sm: '100%'     // Full width on small screens
      },
      main: {
        base: '50%',   // Default for larger screens
        md: '75%',     // Wider on medium screens
        sm: '100%'     // Full width on small screens
      },
      right: {
        base: '30%',   // Default for larger screens
        md: '0%',      // Hidden or minimized on medium screens
        sm: '0%'       // Hidden on small screens
      }
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
  };

// Export themes with different configurations
export const theme = {
  default: baseTheme,
  highContrast: {
    ...baseTheme,
    colors: {
      background: {
        primary: '#000000',
        secondary: '#1A1A1A',
        tertiary: '#2A2A2A',
        elevated: '#3A3A3A',
        overlay: 'rgba(0, 0, 0, 0.9)'
      },
      accent: {
        primary: '#FFFFFF',
        primaryHover: '#E0E0E0',
        primaryActive: '#C0C0C0',
        secondary: '#00FFFF',
        secondaryHover: '#00CCCC',
        muted: 'rgba(255, 255, 255, 0.1)',
        focus: 'rgba(255, 255, 255, 0.3)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.8)',
        tertiary: 'rgba(255, 255, 255, 0.6)',
        inverse: '#000000',
        onAccent: '#000000'
      },
      priority: {
        high: '#FF0000',
        highBg: 'rgba(255, 0, 0, 0.2)',
        medium: '#FFFF00',
        mediumBg: 'rgba(255, 255, 0, 0.2)',
        low: '#00FF00',
        lowBg: 'rgba(0, 255, 0, 0.2)',
        completed: '#AAAAAA',
        completedBg: 'rgba(170, 170, 170, 0.2)'
      },
      status: {
        success: '#00FF00',
        successBg: 'rgba(0, 255, 0, 0.2)',
        warning: '#FFFF00',
        warningBg: 'rgba(255, 255, 0, 0.2)',
        error: '#FF0000',
        errorBg: 'rgba(255, 0, 0, 0.2)',
        info: '#00FFFF',
        infoBg: 'rgba(0, 255, 255, 0.2)'
      },
      border: {
        default: '#FFFFFF',
        light: '#E0E0E0',
        heavy: '#C0C0C0',
        accent: '#FFFFFF'
      }
    }
  }
};

// Helper functions for consistent styling
export const getTextSize = (size: keyof typeof theme.default.typography.fontSize) => {
  return theme.default.typography.fontSize[size]
}

export const getSpacing = (size: keyof typeof theme.default.spacing.component) => {
  return theme.default.spacing.component[size]
}

export const getButtonClasses = (variant: keyof typeof theme.default.components.button.variants, size: keyof typeof theme.default.components.button.sizes = 'md') => {
  return `${theme.default.components.button.sizes[size]} ${theme.default.components.button.variants[variant]} rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-background-primary`
}