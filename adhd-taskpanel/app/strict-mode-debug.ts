// Enable additional debugging in development
if (process.env.NODE_ENV === 'development') {
  // Log when components are mounted/unmounted in strict mode
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('React has detected a change in the order of Hooks')
    ) {
      console.trace('Hook order violation detected:');
    }
    originalConsoleWarn.apply(console, args);
  };
}

export {};