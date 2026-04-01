import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";

process.env.SECRET = "testsecret";

// 1. Mock requireAuth BEFORE importing routes
jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => next())
}));

// 2. Import AFTER mocks
const usersRoutes = (await import("../../src/routes/usersRoutes.js")).default;
const requireAuth = (await import("../../src/middleware/requireAuth.js")).default;

const User = (await import("../../src/models/User.js")).default;

const app = express();
app.use(express.json());
app.use("/users", usersRoutes);

describe("Users Controller Integration", () => {
  beforeEach(async () => {
    await User.deleteMany();
    jest.clearAllMocks();
  });

  test("signup → login → get user", async () => {
    const signupRes = await request(app)
      .post("/users/signup")
      .send({
        name: "Kostas",
        email: "kostas@test.com",
        password: "StrongPass123!",
        role: "user"
      });

    expect(signupRes.status).toBe(201);

    const usersListRes = await request(app).get("/users");
    const createdUser = usersListRes.body.find(
      (u) => u.email === "kostas@test.com"
    );

    const userId = createdUser._id;

    const loginRes = await request(app)
      .post("/users/login")
      .send({
        email: "kostas@test.com",
        password: "StrongPass123!"
      });

    expect(loginRes.status).toBe(200);

    const getRes = await request(app).get(`/users/${userId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe("Kostas");
  });

  test("update user", async () => {
    const signupRes = await request(app)
      .post("/users/signup")
      .send({
        name: "Old Name",
        email: "old@test.com",
        password: "StrongPass123!",
        role: "user"
      });

    expect(signupRes.status).toBe(201);

    const usersListRes = await request(app).get("/users");
    const user = usersListRes.body.find((u) => u.email === "old@test.com");

    const res = await request(app)
      .put(`/users/${user._id}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New Name");
  });

  test("delete user (with password)", async () => {
    // Create user
    const signupRes = await request(app)
      .post("/users/signup")
      .send({
        name: "Delete Me",
        email: "delete@test.com",
        password: "StrongPass123!",
        role: "user"
      });

    expect(signupRes.status).toBe(201);

    // Fetch created user
    const usersListRes = await request(app).get("/users");
    const user = usersListRes.body.find((u) => u.email === "delete@test.com");

    // Mock requireAuth so authenticated user = the same user
    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    // Delete user
    const res = await request(app)
      .delete(`/users/${user._id}`)
      .send({ password: "StrongPass123!" });

    expect(res.status).toBe(200);

    // Confirm deletion
    const afterRes = await request(app).get(`/users/${user._id}`);
    expect(afterRes.status).toBe(404);
  });
});
