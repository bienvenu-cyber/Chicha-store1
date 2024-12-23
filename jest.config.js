module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/backend'],
  testMatch: [
    '**/__tests__/**/*.+(js|ts)',
    '**/?(*.)+(spec|test).+(js|ts)'
  ],
  moduleFileExtensions: ['js', 'ts', 'json'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  collectCoverageFrom: [
    'backend/**/*.{js,ts}',
    '!backend/**/*.d.ts',
    '!backend/**/index.js',
    '!backend/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Mocking and setup
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  
  verbose: true
};
