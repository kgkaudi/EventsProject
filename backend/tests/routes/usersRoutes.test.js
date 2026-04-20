import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// -------------------------------------------------------
// 1. Mock controllers BEFORE importing routes
// -------------------------------------------------------
jest.unstable_mockModule("../../src/controllers/usersController.js", () => ({
  loginUser: jest.fn(),
  signupUser: jest.fn(),
  getUsers: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  updateUserPassword: jest.fn(),
  deleteUser: jest.fn(),
  updateUserRole: jest.fn()
}));

// -------------------------------------------------------
// 2. Mock requireAuth BEFORE importing routes
// -------------------------------------------------------
jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => {
    req.user = { _id: "mockUser123", role: "user" };
    next();
  })
}));

// -------------------------------------------------------
// 3. Mock adminOnly BEFORE importing routes
// -------------------------------------------------------
jest.unstable_mockModule("../../src/middleware/adminOnly.js", () => ({
  default: jest.fn((req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  })
}));

// -------------------------------------------------------
// 4. Import mocked modules
// -------------------------------------------------------
const usersController = await import("../../src/controllers/usersController.js");
const requireAuth = (await import("../../src/middleware/requireAuth.js")).default;
const adminOnly = (await import("../../src/middleware/adminOnly.js")).default;

// -------------------------------------------------------
// 5. Import routes AFTER mocks
// -------------------------------------------------------
const usersRoutes = (await import("../../src/routes/usersRoutes.js")).default;

// -------------------------------------------------------
// 6. Build express app
// -------------------------------------------------------
const app = express();
app.use(express.json());
app.use("/users", usersRoutes);

// Add error handler for thrown controller errors
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// ============================================================================
// TEST SUITE
// ============================================================================
describe("Users Routes (Success + Edge Cases)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================================================
  // SUCCESS CASES
  // ============================================================================

  test("POST /users/login calls loginUser", async () => {
    usersController.loginUser.mockImplementation((req, res) =>
      res.status(200).json({ message: "Logged in" })
    );

    const res = await request(app)
      .post("/users/login")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(usersController.loginUser).toHaveBeenCalled();
  });

  test("POST /users/signup calls signupUser", async () => {
    usersController.signupUser.mockImplementation((req, res) =>
      res.status(201).json({ message: "Signed up" })
    );

    const res = await request(app)
      .post("/users/signup")
      .send({ name: "Kostas", email: "test@test.com", password: "123456" });

    expect(res.status).toBe(201);
    expect(usersController.signupUser).toHaveBeenCalled();
  });

  test("GET /users calls getUsers", async () => {
    usersController.getUsers.mockImplementation((req, res) =>
      res.status(200).json([{ name: "Kostas" }])
    );

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(usersController.getUsers).toHaveBeenCalled();
  });

  test("GET /users/:id calls getUser", async () => {
    usersController.getUser.mockImplementation((req, res) =>
      res.status(200).json({ name: "Kostas" })
    );

    const res = await request(app).get("/users/123");

    expect(res.status).toBe(200);
    expect(usersController.getUser).toHaveBeenCalled();
  });

  test("PUT /users/:id calls updateUser", async () => {
    usersController.updateUser.mockImplementation((req, res) =>
      res.status(200).json({ name: "Updated" })
    );

    const res = await request(app)
      .put("/users/123")
      .send({ name: "Updated" });

    expect(res.status).toBe(200);
    expect(usersController.updateUser).toHaveBeenCalled();
  });

  test("PUT /users/change-password/:id calls updateUserPassword", async () => {
    usersController.updateUserPassword.mockImplementation((req, res) =>
      res.status(200).json({ message: "Password updated" })
    );

    const res = await request(app)
      .put("/users/change-password/123")
      .send({ password: "oldPass", newPassword: "NewPass123!" });

    expect(res.status).toBe(200);
    expect(usersController.updateUserPassword).toHaveBeenCalled();
  });

  test("DELETE /users/:id calls deleteUser", async () => {
    usersController.deleteUser.mockImplementation((req, res) =>
      res.status(200).json({ message: "Deleted" })
    );

    const res = await request(app)
      .delete("/users/123")
      .set("Authorization", "Bearer token");

    expect(requireAuth).toHaveBeenCalled();
    expect(usersController.deleteUser).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  // LOGIN
  test("POST /users/login returns 400 for missing fields", async () => {
    usersController.loginUser.mockImplementation((req, res) =>
      res.status(400).json({ error: "Missing fields" })
    );

    const res = await request(app).post("/users/login").send({});

    expect(res.status).toBe(400);
  });

  test("POST /users/login returns 500 on controller error", async () => {
    usersController.loginUser.mockImplementation(() => {
      throw new Error("Login error");
    });

    const res = await request(app)
      .post("/users/login")
      .send({ email: "a@a.com", password: "123456" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/login error/i);
  });

  // SIGNUP
  test("POST /users/signup returns 400 for invalid data", async () => {
    usersController.signupUser.mockImplementation((req, res) =>
      res.status(400).json({ error: "Invalid data" })
    );

    const res = await request(app).post("/users/signup").send({});

    expect(res.status).toBe(400);
  });

  test("POST /users/signup returns 500 on controller error", async () => {
    usersController.signupUser.mockImplementation(() => {
      throw new Error("Signup error");
    });

    const res = await request(app)
      .post("/users/signup")
      .send({ email: "a@a.com", password: "123456" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/signup error/i);
  });

  // GET /users/:id
  test("GET /users/:id returns 404 when user not found", async () => {
    usersController.getUser.mockImplementation((req, res) =>
      res.status(404).json({ error: "User not found" })
    );

    const res = await request(app).get("/users/123");

    expect(res.status).toBe(404);
  });

  test("GET /users/:id returns 400 for invalid ID", async () => {
    usersController.getUser.mockImplementation((req, res) =>
      res.status(400).json({ error: "Invalid ID" })
    );

    const res = await request(app).get("/users/invalid");

    expect(res.status).toBe(400);
  });

  // UPDATE USER
  test("PUT /users/:id returns 400 for invalid data", async () => {
    usersController.updateUser.mockImplementation((req, res) =>
      res.status(400).json({ error: "Invalid data" })
    );

    const res = await request(app).put("/users/123").send({});

    expect(res.status).toBe(400);
  });

  test("PUT /users/:id returns 500 on controller error", async () => {
    usersController.updateUser.mockImplementation(() => {
      throw new Error("Update error");
    });

    const res = await request(app).put("/users/123").send({ name: "New" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/update error/i);
  });

  // CHANGE PASSWORD
  test("PUT /users/change-password/:id returns 400 for invalid data", async () => {
    usersController.updateUserPassword.mockImplementation((req, res) =>
      res.status(400).json({ error: "Invalid password" })
    );

    const res = await request(app)
      .put("/users/change-password/123")
      .send({});

    expect(res.status).toBe(400);
  });

  // DELETE USER (auth required)
  test("DELETE /users/:id returns 500 on controller error", async () => {
    usersController.deleteUser.mockImplementation(() => {
      throw new Error("Delete error");
    });

    const res = await request(app)
      .delete("/users/123")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/delete error/i);
  });

  // UPDATE USER ROLE (admin only)
  test("PUT /users/:id/role returns 403 for non-admin", async () => {
    const res = await request(app)
      .put("/users/123/role")
      .set("Authorization", "Bearer token")
      .send({ role: "admin" });

    expect(adminOnly).toHaveBeenCalled();
    expect(res.status).toBe(403);
  });

  test("PUT /users/:id/role returns 500 on controller error", async () => {
    // Make user admin
    requireAuth.mockImplementationOnce((req, res, next) => {
      req.user = { _id: "mockUser123", role: "admin" };
      next();
    });

    usersController.updateUserRole.mockImplementation(() => {
      throw new Error("Role update error");
    });

    const res = await request(app)
      .put("/users/123/role")
      .set("Authorization", "Bearer token")
      .send({ role: "admin" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/role update error/i);
  });
});
