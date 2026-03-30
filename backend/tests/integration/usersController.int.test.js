import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

process.env.SECRET = "testsecret";

const app = express();
app.use(express.json());

const usersRoutes = (await import("../../src/routes/usersRoutes.js")).default;
app.use("/users", usersRoutes);

describe("Users Controller Integration", () => {
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

  test("delete user", async () => {
    const signupRes = await request(app)
      .post("/users/signup")
      .send({
        name: "Delete Me",
        email: "delete@test.com",
        password: "StrongPass123!",
        role: "user"
      });

    expect(signupRes.status).toBe(201);

    const usersListRes = await request(app).get("/users");
    const user = usersListRes.body.find((u) => u.email === "delete@test.com");

    const res = await request(app).delete(`/users/${user._id}`);
    expect(res.status).toBe(200);

    const afterRes = await request(app).get(`/users/${user._id}`);
    expect(afterRes.status).toBe(404);
  });
});
