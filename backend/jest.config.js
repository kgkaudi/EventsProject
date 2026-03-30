export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setupDB.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1.js"
  }
};
