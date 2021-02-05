module.exports = {
  preset: 'ts-jest',

  // Test files are .js and .ts files inside of __tests__ folders and with a suffix of .test or .spec
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s'],

  // Exclude E2E tests
  testPathIgnorePatterns: ['<rootDir>/src/__tests__']
};
