import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 1. Mock controllers BEFORE importing routes
jest.unstable_mockModule("../../src/controllers/usersController.js", () => ({
  loginUser: jest.fn(),
  signupUser: jest.fn(),
  getUsers: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  updateUserPassword: jest.fn(),
  deleteUser: jest.fn()
}));

// 2. Import mocked controllers
const usersController = await import("../../src/controllers/usersController.js");

// 3. Import routes AFTER mocks
const usersRoutes = (await import("../../src/routes/usersRoutes.js")).default;

// 4. Build app AFTER importing routes
const app = express();
app.use(express.json());
app.use("/users", usersRoutes);

describe("Users Routes", () => {
  beforeEach(() => jest.clearAllMocks());

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

    const res = await request(app).delete("/users/123");

    expect(res.status).toBe(200);
    expect(usersController.deleteUser).toHaveBeenCalled();
  });
});
