import { jest } from "@jest/globals";

// -------------------------------------------------------
// 1. Mock dependencies BEFORE importing controller
// -------------------------------------------------------
jest.unstable_mockModule("../../src/models/User.js", () => ({
  default: {
    login: jest.fn(),
    signup: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  }
}));

jest.unstable_mockModule("../../src/models/Event.js", () => ({
  default: {
    deleteMany: jest.fn()
  }
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn()
  }
}));

jest.unstable_mockModule("validator", () => ({
  default: {
    isStrongPassword: jest.fn()
  }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn()
  }
}));

// -------------------------------------------------------
// 2. Import mocks
// -------------------------------------------------------
const User = (await import("../../src/models/User.js")).default;
const Event = (await import("../../src/models/Event.js")).default;
const bcrypt = (await import("bcryptjs")).default;
const validator = (await import("validator")).default;
const jwt = (await import("jsonwebtoken")).default;

// -------------------------------------------------------
// 3. Import controller AFTER mocks
// -------------------------------------------------------
const usersController = await import("../../src/controllers/usersController.js");

// -------------------------------------------------------
// 4. Helper for mock req/res
// -------------------------------------------------------
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("usersController Unit Tests (Success + Edge Cases)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================================================
  // LOGIN USER
  // ============================================================================
  test("loginUser → success", async () => {
    const req = { body: { email: "a@a.com", password: "123" } };
    const res = mockResponse();

    User.login.mockResolvedValue({
      _id: "123",
      name: "Kostas",
      email: "a@a.com",
      role: "user"
    });

    jwt.sign.mockReturnValue("token123");

    await usersController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "token123",
        user: expect.objectContaining({ id: "123" })
      })
    );
  });

  test("loginUser → error thrown", async () => {
    const req = { body: { email: "a@a.com", password: "123" } };
    const res = mockResponse();

    User.login.mockRejectedValue(new Error("Login failed"));

    await usersController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Login failed" });
  });

  // ============================================================================
  // SIGNUP USER
  // ============================================================================
  test("signupUser → success", async () => {
    const req = {
      body: {
        name: "Kostas",
        email: "a@a.com",
        password: "StrongPass123!",
        role: "user"
      }
    };
    const res = mockResponse();

    User.signup.mockResolvedValue({
      _id: "123",
      name: "Kostas",
      email: "a@a.com",
      role: "user"
    });

    jwt.sign.mockReturnValue("token123");

    await usersController.signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "token123",
        user: expect.objectContaining({ id: "123" })
      })
    );
  });

  test("signupUser → error thrown", async () => {
    const req = { body: {} };
    const res = mockResponse();

    User.signup.mockRejectedValue(new Error("Signup failed"));

    await usersController.signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Signup failed" });
  });

  // ============================================================================
  // GET USERS
  // ============================================================================
  test("getUsers → success", async () => {
    const req = {};
    const res = mockResponse();

    User.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: "Kostas" }])
    });

    await usersController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getUsers → DB error", async () => {
    const req = {};
    const res = mockResponse();

    User.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("DB error"))
    });

    await usersController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ============================================================================
  // GET USER
  // ============================================================================
  test("getUser → success", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    User.findById.mockResolvedValue({ name: "Kostas" });

    await usersController.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getUser → not found", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    User.findById.mockResolvedValue(null);

    await usersController.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getUser → invalid ID (CastError)", async () => {
    const req = { params: { id: "bad" } };
    const res = mockResponse();

    const err = new Error("Bad ID");
    err.name = "CastError";

    User.findById.mockRejectedValue(err);

    await usersController.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getUser → server error", async () => {
    const req = { params: { id: "123" } };
    const res = mockResponse();

    User.findById.mockRejectedValue(new Error("DB error"));

    await usersController.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ============================================================================
  // UPDATE USER
  // ============================================================================
  test("updateUser → success", async () => {
    const req = { params: { id: "123" }, body: { name: "New" } };
    const res = mockResponse();

    User.findByIdAndUpdate.mockResolvedValue({ name: "New" });

    await usersController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateUser → not found", async () => {
    const req = { params: { id: "123" }, body: {} };
    const res = mockResponse();

    User.findByIdAndUpdate.mockResolvedValue(null);

    await usersController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUser → invalid ID", async () => {
    const req = { params: { id: "bad" }, body: {} };
    const res = mockResponse();

    const err = new Error("Bad ID");
    err.name = "CastError";

    User.findByIdAndUpdate.mockRejectedValue(err);

    await usersController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUser → server error", async () => {
    const req = { params: { id: "123" }, body: {} };
    const res = mockResponse();

    User.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

    await usersController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ============================================================================
  // UPDATE USER PASSWORD
  // ============================================================================
  test("updateUserPassword → missing fields", async () => {
    const req = { params: { id: "123" }, body: {} };
    const res = mockResponse();

    await usersController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateUserPassword → weak password", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "old", newPassword: "weak" }
    };
    const res = mockResponse();

    validator.isStrongPassword.mockReturnValue(false);

    await usersController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("updateUserPassword → user not found", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "old", newPassword: "StrongPass123!" }
    };
    const res = mockResponse();

    validator.isStrongPassword.mockReturnValue(true);
    User.findById.mockResolvedValue(null);

    await usersController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUserPassword → wrong current password", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "wrong", newPassword: "StrongPass123!" }
    };
    const res = mockResponse();

    validator.isStrongPassword.mockReturnValue(true);
    User.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await usersController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("updateUserPassword → success", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "old", newPassword: "StrongPass123!" }
    };
    const res = mockResponse();

    validator.isStrongPassword.mockReturnValue(true);
    User.findById.mockResolvedValue({
      password: "hashed",
      save: jest.fn()
    });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newhash");

    await usersController.updateUserPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ============================================================================
  // DELETE USER
  // ============================================================================
  test("deleteUser → missing password", async () => {
    const req = { params: { id: "123" }, body: {}, user: { _id: "admin" } };
    const res = mockResponse();

    await usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deleteUser → admin not found", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "pass" },
      user: { _id: "admin" }
    };
    const res = mockResponse();

    User.findById.mockResolvedValue(null);

    await usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("deleteUser → wrong admin password", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "wrong" },
      user: { _id: "admin" }
    };
    const res = mockResponse();

    User.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deleteUser → user not found", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "pass" },
      user: { _id: "admin" }
    };
    const res = mockResponse();

    User.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    User.findByIdAndDelete.mockResolvedValue(null);

    await usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteUser → success", async () => {
    const req = {
      params: { id: "123" },
      body: { password: "pass" },
      user: { _id: "admin" }
    };
    const res = mockResponse();

    User.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    User.findByIdAndDelete.mockResolvedValue({ _id: "123" });
    Event.deleteMany.mockResolvedValue({});

    await usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ============================================================================
  // UPDATE USER ROLE
  // ============================================================================
  test("updateUserRole → invalid role", async () => {
    const req = { params: { id: "123" }, body: { role: "invalid" } };
    const res = mockResponse();

    await usersController.updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateUserRole → not found", async () => {
    const req = { params: { id: "123" }, body: { role: "admin" } };
    const res = mockResponse();

    User.findByIdAndUpdate.mockResolvedValue(null);

    await usersController.updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUserRole → success", async () => {
    const req = { params: { id: "123" }, body: { role: "admin" } };
    const res = mockResponse();

    User.findByIdAndUpdate.mockResolvedValue({ _id: "123", role: "admin" });

    await usersController.updateUserRole(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" })
    );
  });

  test("updateUserRole → server error", async () => {
    const req = { params: { id: "123" }, body: { role: "admin" } };
    const res = mockResponse();

    User.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

    await usersController.updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
