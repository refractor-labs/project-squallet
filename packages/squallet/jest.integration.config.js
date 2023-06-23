/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFiles: ['dotenv/config'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  }
}
