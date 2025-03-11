export const theme = {
  colors: {
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2D2D2D'
    },
    accent: {
      primary: '#7B68EE',    // Deep purple
      secondary: '#20B2AA'   // Teal
    },
    text: {
      primary: '#E0E0E0',
      secondary: 'rgba(224, 224, 224, 0.7)'
    },
    priority: {
      high: '#FF5252',
      medium: '#FFB300',
      low: '#4CAF50',
      completed: '#757575'
    },
    border: '#2D2D2D',
    hover: 'rgba(123, 104, 238, 0.1)'  // Deep purple with opacity
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600
    },
    lineHeight: {
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    panel: {
      left: '20%',
      main: '50%',
      right: '30%'
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
}