module.exports = {
  preset: 'ts-jest',

  // Test files are .js and .ts files inside of __tests__ folders and with a suffix of .test or .spec
  testMatch: ['<rootDir>/src/**/__tests__/**/?(*.)+(spec|test).[jt]s'],

  // Exclude E2E tests
  testPathIgnorePatterns: ['<rootDir>/src/__tests__'],

  // Required when using Split dependencies via GitHub
  // `"@splitsoftware/splitio-commons": "github:splitio/javascript-commons#branch_name",`
  transform: { 'node_modules/@splitsoftware/.+\\.(j|t)s$': 'ts-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@splitsoftware/.*)']
};
