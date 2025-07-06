// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Make axe accessible via global jest-axe object
const { axe, toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);
global.axe = axe;


// jest.polyfills.js (if you created it for TextEncoder/Decoder)
// require('./jest.polyfills');

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  observe(target) {
    // Trigger the callback for testing purposes
    // this.callback([{ isIntersecting: true, target }]);
    return null;
  }
  unobserve(target) {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.confirm
global.confirm = jest.fn(() => true); // Default to true, can be overridden in tests

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substring(7)),
}));
