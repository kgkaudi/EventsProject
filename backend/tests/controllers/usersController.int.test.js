import { jest } from "@jest/globals";

// -------------------------------------------------------
// 1. Mock the service layer BEFORE importing the controller
// -------------------------------------------------------
jest.unstable_mockModule("../../src/services/userService.js", () => ({
  userService: {
    login: jest.fn(),
    signup: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    deleteUser: jest.fn(),
    updateRole: jest.fn(),
  },
}));

// -------------------------------------------------------
// 2. Import the mock
// -------------------------------------------------------
const { userService } = await import("../../src/services/userService.js");

// -------------------------------------------------------
// 3. Import the controller AFTER the mock is registered
// -------------------------------------------------------
const usersController =
  await import("../../src/controllers/usersController.js");

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
  describe("loginUser", () => {
    test("missing identifier or password → 400", async () => {
      const req = { body: { password: "123" } };
      const res = mockResponse();

      await usersController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(userService.login).not.toHaveBeenCalled();
    });

    test("identifier is an email → forwarded as-is to the service", async () => {
      const req = { body: { identifier: "a@a.com", password: "123" } };
      const res = mockResponse();

      userService.login.mockResolvedValue({ token: "token123", user: { id: "123" } });

      await usersController.loginUser(req, res);

      // User.login (inside the service/repository) already handles
      // deciding whether the identifier is an email or a name, so the
      // controller just forwards the raw string.
      expect(userService.login).toHaveBeenCalledWith("a@a.com", "123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "token123", user: { id: "123" } });
    });

    test("identifier is a username → forwarded as-is to the service", async () => {
      const req = { body: { identifier: "Kostas", password: "123" } };
      const res = mockResponse();

      userService.login.mockResolvedValue({ token: "token123", user: { id: "123" } });

      await usersController.loginUser(req, res);

      expect(userService.login).toHaveBeenCalledWith("Kostas", "123");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("user not found → 404", async () => {
      const req = { body: { identifier: "a@a.com", password: "123" } };
      const res = mockResponse();

      userService.login.mockRejectedValue(new Error("User not found"));

      await usersController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    test("invalid credentials → 401", async () => {
      const req = { body: { identifier: "a@a.com", password: "wrong" } };
      const res = mockResponse();

      userService.login.mockRejectedValue(new Error("Invalid credentials"));

      await usersController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    test("unexpected error → 500", async () => {
      const req = { body: { identifier: "a@a.com", password: "123" } };
      const res = mockResponse();

      userService.login.mockRejectedValue(new Error("DB exploded"));

      await usersController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB exploded" });
    });
  });

  // ============================================================================
  // SIGNUP USER
  // ============================================================================
  describe("signupUser", () => {
    test("success → 201", async () => {
      const req = {
        body: {
          name: "Kostas",
          email: "a@a.com",
          password: "StrongPass123!",
          role: "user",
        },
      };
      const res = mockResponse();

      userService.signup.mockResolvedValue({ token: "token123", user: { id: "123" } });

      await usersController.signupUser(req, res);

      expect(userService.signup).toHaveBeenCalledWith(
        "Kostas",
        "a@a.com",
        "StrongPass123!",
        "user",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token: "token123", user: { id: "123" } });
    });

    test("error thrown → 500", async () => {
      const req = { body: {} };
      const res = mockResponse();

      userService.signup.mockRejectedValue(new Error("Signup failed"));

      await usersController.signupUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Signup failed" });
    });
  });

  // ============================================================================
  // GET USERS
  // ============================================================================
  describe("getUsers", () => {
    test("success → 200", async () => {
      const req = {};
      const res = mockResponse();

      userService.getUsers.mockResolvedValue([{ name: "Kostas" }]);

      await usersController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ name: "Kostas" }]);
    });

    test("service error → 500 with generic message", async () => {
      const req = {};
      const res = mockResponse();

      userService.getUsers.mockRejectedValue(new Error("DB error"));

      await usersController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  // ============================================================================
  // GET USER BY ID
  // ============================================================================
  describe("getUser", () => {
    test("success → 200", async () => {
      const req = { params: { id: "123" } };
      const res = mockResponse();

      userService.getUser.mockResolvedValue({ name: "Kostas" });

      await usersController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ name: "Kostas" });
    });

    test("not found → 404", async () => {
      const req = { params: { id: "123" } };
      const res = mockResponse();

      userService.getUser.mockRejectedValue(new Error("User not found"));

      await usersController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("invalid ID (CastError) → 500", async () => {
      const req = { params: { id: "bad" } };
      const res = mockResponse();

      const err = new Error("Bad ID");
      err.name = "CastError";
      userService.getUser.mockRejectedValue(err);

      await usersController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("server error → 500", async () => {
      const req = { params: { id: "123" } };
      const res = mockResponse();

      userService.getUser.mockRejectedValue(new Error("DB error"));

      await usersController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================================================
  // UPDATE USER
  // ============================================================================
  describe("updateUser", () => {
    test("success → 200", async () => {
      const req = { params: { id: "123" }, body: { name: "New" } };
      const res = mockResponse();

      userService.updateUser.mockResolvedValue({ name: "New" });

      await usersController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith("123", { name: "New" });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("not found → 404", async () => {
      const req = { params: { id: "123" }, body: {} };
      const res = mockResponse();

      userService.updateUser.mockRejectedValue(new Error("User not found"));

      await usersController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("invalid ID (CastError) → 500", async () => {
      const req = { params: { id: "bad" }, body: {} };
      const res = mockResponse();

      const err = new Error("Bad ID");
      err.name = "CastError";
      userService.updateUser.mockRejectedValue(err);

      await usersController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("server error → 500", async () => {
      const req = { params: { id: "123" }, body: {} };
      const res = mockResponse();

      userService.updateUser.mockRejectedValue(new Error("DB error"));

      await usersController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================================================
  // UPDATE USER PASSWORD
  // ============================================================================
  describe("updateUserPassword", () => {
    test("missing fields → 400", async () => {
      const req = { params: { id: "123" }, body: {} };
      const res = mockResponse();

      await usersController.updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });

    test("service reports missing field ('required') → 400", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "old", newPassword: "new" },
      };
      const res = mockResponse();

      userService.updatePassword.mockRejectedValue(
        new Error("Current password and new password are required"),
      );

      await usersController.updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("weak new password ('strong') → 400", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "old", newPassword: "weak" },
      };
      const res = mockResponse();

      userService.updatePassword.mockRejectedValue(
        new Error("New Password is not strong enough"),
      );

      await usersController.updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("incorrect current password ('Incorrect') → 401", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "wrong", newPassword: "StrongPass123!" },
      };
      const res = mockResponse();

      userService.updatePassword.mockRejectedValue(
        new Error("Incorrect current password"),
      );

      await usersController.updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("user not found → 404", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "old", newPassword: "StrongPass123!" },
      };
      const res = mockResponse();

      userService.updatePassword.mockRejectedValue(new Error("User not found"));

      await usersController.updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("success → 200", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "old", newPassword: "StrongPass123!" },
      };
      const res = mockResponse();

      userService.updatePassword.mockResolvedValue({ message: "Password updated" });

      await usersController.updateUserPassword(req, res);

      expect(userService.updatePassword).toHaveBeenCalledWith(
        "123",
        "old",
        "StrongPass123!",
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("unexpected error → 500", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "old", newPassword: "StrongPass123!" },
      };
      const res = mockResponse();

      userService.updatePassword.mockRejectedValue(new Error("DB exploded"));

      await usersController.updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================================================
  // DELETE USER
  // ============================================================================
  describe("deleteUser", () => {
    test("password required → 500 (per controller mapping)", async () => {
      const req = { params: { id: "123" }, body: {}, user: { _id: "admin" } };
      const res = mockResponse();

      userService.deleteUser.mockRejectedValue(
        new Error("Password is required"),
      );

      await usersController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("unauthorized → 401", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "pass" },
        user: { _id: "admin" },
      };
      const res = mockResponse();

      userService.deleteUser.mockRejectedValue(new Error("Unauthorized"));

      await usersController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("incorrect password → 400", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "wrong" },
        user: { _id: "admin" },
      };
      const res = mockResponse();

      userService.deleteUser.mockRejectedValue(new Error("Incorrect password"));

      await usersController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("user not found → 404", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "pass" },
        user: { _id: "admin" },
      };
      const res = mockResponse();

      userService.deleteUser.mockRejectedValue(new Error("User not found"));

      await usersController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("success → 200", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "pass" },
        user: { _id: "admin" },
      };
      const res = mockResponse();

      userService.deleteUser.mockResolvedValue({ message: "User deleted" });

      await usersController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith("admin", "123", "pass");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("unexpected error → 500", async () => {
      const req = {
        params: { id: "123" },
        body: { password: "pass" },
        user: { _id: "admin" },
      };
      const res = mockResponse();

      userService.deleteUser.mockRejectedValue(new Error("DB exploded"));

      await usersController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================================================
  // UPDATE USER ROLE
  // ============================================================================
  describe("updateUserRole", () => {
    test("invalid role → 400", async () => {
      const req = { params: { id: "123" }, body: { role: "invalid" } };
      const res = mockResponse();

      userService.updateRole.mockRejectedValue(new Error("Invalid role"));

      await usersController.updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("not found → 404", async () => {
      const req = { params: { id: "123" }, body: { role: "admin" } };
      const res = mockResponse();

      userService.updateRole.mockRejectedValue(new Error("User not found"));

      await usersController.updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("success → 200", async () => {
      const req = { params: { id: "123" }, body: { role: "admin" } };
      const res = mockResponse();

      userService.updateRole.mockResolvedValue({ _id: "123", role: "admin" });

      await usersController.updateUserRole(req, res);

      expect(userService.updateRole).toHaveBeenCalledWith("123", "admin");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ role: "admin" }),
      );
    });

    test("server error → 500", async () => {
      const req = { params: { id: "123" }, body: { role: "admin" } };
      const res = mockResponse();

      userService.updateRole.mockRejectedValue(new Error("DB error"));

      await usersController.updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});