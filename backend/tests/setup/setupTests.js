import { jest } from "@jest/globals";
// Silence console.error in all tests
jest.spyOn(console, "error").mockImplementation(() => {});
