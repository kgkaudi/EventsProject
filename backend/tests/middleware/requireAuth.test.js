import { jest } from "@jest/globals";
import mongoose from "mongoose";

// Clear mongoose cache safely
if (mongoose.modelNames().includes("User")) {
  delete mongoose.models.User;
}

// -------------------------------------------------------
// 1. Mock User model BEFORE importing middleware
// -------------------------------------------------------
jest.unstable_mockModule("../../src/models/User.js", () => {
  return {
    default: {
      findById: jest.fn()
    }
  };
});

// -------------------------------------------------------
// 2. Mock JWT BEFORE importing middleware
// -------------------------------------------------------
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn()
  }
}));

// -------------------------------------------------------
// 3. Import mocks
// -------------------------------------------------------
const User = (await import("../../src/models/User.js")).default;
const jwt = (await import("jsonwebtoken")).default;

// -------------------------------------------------------
// 4. Import middleware AFTER mocks
// -------------------------------------------------------
const requireAuth = (await import("../../src/middleware/requireAuth.js")).default;

// Silence console.log
jest.spyOn(console, "log").mockImplementation(() => {});

// Helper for mock response
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("requireAuth Middleware (Success + Edge Cases)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================================================
  // ORIGINAL SUCCESS CASES
  // ============================================================================

  test("returns 401 if no Authorization header", async () => {
    const req = { headers: {} };
    const res = mockResponse();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 if token invalid", async () => {
    const req = { headers: { authorization: "Bearer badtoken" } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 if user not found", async () => {
    const req = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ _id: "123" });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await requireAuth(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("calls next() when token valid and user exists", async () => {
    const req = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ _id: "123" });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "123", role: "admin" })
    });

    await requireAuth(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("123");
    expect(next).toHaveBeenCalled();
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  test("returns 401 if Authorization header does not start with Bearer", async () => {
    const req = { headers: { authorization: "Token abc123" } };
    const res = mockResponse();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 if jwt.verify returns payload without _id", async () => {
    const req = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({}); // missing _id

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 if User.findById throws DB error", async () => {
    const req = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ _id: "123" });

    User.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB error"))
    });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 if jwt.verify throws unexpected error", async () => {
    const req = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error("Unexpected failure");
    });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
