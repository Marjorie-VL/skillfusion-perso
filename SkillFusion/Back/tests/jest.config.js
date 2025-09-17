module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/Back/jest.setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/'
  ],
  globalSetup: '<rootDir>/tests/jest-global-setup.js',
  globalTeardown: '<rootDir>/tests/jest-global-teardown.js'
};