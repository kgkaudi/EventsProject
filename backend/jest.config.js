export default {
  testEnvironment: "node",
  transform: {},
  setupFiles: [],

  setupFilesAfterEnv: [
    "<rootDir>/tests/setup/setupDB.js",
    "<rootDir>/tests/setup/setupTests.js"
  ],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1.js"
  }
};
