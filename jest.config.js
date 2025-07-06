module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle CSS imports (if you're using them directly in components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    // Alias to match tsconfig.json paths
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/app/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/app/types/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Collect coverage from
  collectCoverageFrom: [
    'app/components/**/*.{ts,tsx}',
    '!app/components/**/index.ts', // Exclude index files if any
    '!app/components/**/*.stories.tsx', // Exclude storybook files
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // setupFiles: ['./jest.polyfills.js'], // if using TextEncoder/TextDecoder
};
