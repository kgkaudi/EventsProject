import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";

process.env.SECRET = "testsecret";

// -------------------------------------------------------------
// 1. Mock modules BEFORE importing anything else
// -------------------------------------------------------------
jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => next())
}));

jest.unstable_mockModule("../../src/middleware/adminOnly.js", () => ({
  default: jest.fn((req, res, next) => next())
}));

// -------------------------------------------------------------
// 2. Declare variables to be filled in beforeAll
// -------------------------------------------------------------
let requireAuth;
let eventsRoutes;
let User;
let Event;
let app;

// -------------------------------------------------------------
// 3. Import everything AFTER mocks
// -------------------------------------------------------------
beforeAll(async () => {
  requireAuth = (await import("../../src/middleware/requireAuth.js")).default;
  eventsRoutes = (await import("../../src/routes/eventsRoutes.js")).default;
  User = (await import("../../src/models/User.js")).default;
  Event = (await import("../../src/models/Event.js")).default;

  app = express();
  app.use(express.json());
  app.use("/events", eventsRoutes);
});

// -------------------------------------------------------------
// 4. Clear DB before each test (ONLY ONE BLOCK)
// -------------------------------------------------------------
beforeEach(async () => {
  await User.deleteMany();
  await Event.deleteMany();
  jest.clearAllMocks();
});

// -------------------------------------------------------------
// 5. TESTS
// -------------------------------------------------------------
describe("Events Controller Integration", () => {

  // ============================================================================
  // CREATE EVENT
  // ============================================================================
  test("create event → success", async () => {
    const user = await User.create({
      name: "Kostas",
      email: "kostas@test.com",
      password: "hashed",
      role: "user"
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    const res = await request(app)
      .post("/events")
      .send({
        title: "My Event",
        content: "Content",
        location: "Athens",
        maxcapacity: 50,
        date: "2025-01-01",
        categories: ["tech"],
        tags: ["react"]
      });

    expect(res.status).toBe(201);

    const events = await Event.find();
    expect(events.length).toBe(1);
    expect(events[0].title).toBe("My Event");
  });

  test("create event → missing user", async () => {
    requireAuth.mockImplementation((req, res, next) => {
      req.user = undefined;
      next();
    });

    const res = await request(app)
      .post("/events")
      .send({ title: "No User" });

    expect(res.status).toBe(400);
  });

  test("create event → user not found", async () => {
    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: new mongoose.Types.ObjectId().toString() };
      next();
    });

    const res = await request(app)
      .post("/events")
      .send({ title: "Bad User" });

    expect(res.status).toBe(404);
  });

  // ============================================================================
  // UPDATE EVENT
  // ============================================================================
  test("update event → success", async () => {
    const user = await User.create({
      name: "Owner",
      email: "owner@test.com",
      password: "hashed",
      role: "user"
    });

    const event = await Event.create({
      title: "Old",
      content: "C",
      location: "Athens",
      maxcapacity: 10,
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: user._id
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    const res = await request(app)
      .put(`/events/${event._id}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
  });

  test("update event → forbidden", async () => {
    const owner = await User.create({
      name: "Owner",
      email: "owner@test.com",
      password: "hashed",
      role: "user"
    });

    const other = await User.create({
      name: "Other",
      email: "other@test.com",
      password: "hashed",
      role: "user"
    });

    const event = await Event.create({
      title: "Old",
      content: "C",
      location: "Athens",
      maxcapacity: 10,
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: owner._id
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: other._id.toString() };
      next();
    });

    const res = await request(app)
      .put(`/events/${event._id}`)
      .send({ title: "Hack" });

    expect(res.status).toBe(403);
  });

  // ============================================================================
  // DELETE EVENT
  // ============================================================================
  test("delete event → success", async () => {
    const user = await User.create({
      name: "Owner",
      email: "owner2@test.com",
      password: "hashed",
      role: "user"
    });

    const event = await Event.create({
      title: "Delete",
      content: "C",
      location: "Athens",
      maxcapacity: 10,
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: user._id
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    const res = await request(app)
      .delete(`/events/${event._id}`);

    expect(res.status).toBe(200);

    const exists = await Event.findById(event._id);
    expect(exists).toBeNull();
  });

  test("delete event → forbidden", async () => {
    const owner = await User.create({
      name: "Owner",
      email: "owner@test.com",
      password: "hashed",
      role: "user"
    });

    const other = await User.create({
      name: "Other",
      email: "other@test.com",
      password: "hashed",
      role: "user"
    });

    const event = await Event.create({
      title: "Secret",
      content: "C",
      location: "Athens",
      maxcapacity: 10,
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: owner._id
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: other._id.toString() };
      next();
    });

    const res = await request(app)
      .delete(`/events/${event._id}`);

    expect(res.status).toBe(403);
  });

  // ============================================================================
  // GET ALL EVENTS (pagination + search)
  // ============================================================================
  test("get events with pagination + search", async () => {
    const user = await User.create({
      name: "Tester",
      email: "tester@test.com",
      password: "hashed",
      role: "user"
    });

    await Event.create([
      {
        title: "React Meetup",
        content: "Learn React",
        location: "Gothenburg",
        date: "2025-01-01",
        categories: ["tech"],
        tags: ["react"],
        createdBy: user._id
      },
      {
        title: "Music Festival",
        content: "Live music",
        location: "Stockholm",
        date: "2025-01-02",
        categories: ["music"],
        tags: ["festival"],
        createdBy: user._id
      }
    ]);

    const res = await request(app)
      .get("/events?page=1&limit=1&q=react");

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(1);
    expect(res.body.total).toBe(1);
    expect(res.body.hasMore).toBe(false);
    expect(res.body.events[0].title).toBe("React Meetup");
    expect(res.body.events[0].createdBy.name).toBe("Tester");
  });

  // ============================================================================
  // GET EVENT
  // ============================================================================
  test("get event → success", async () => {
    const user = await User.create({
      name: "Tester",
      email: "tester@test.com",
      password: "hashed",
      role: "user"
    });

    const event = await Event.create({
      title: "Single",
      content: "C",
      location: "Athens",
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: user._id
    });

    const res = await request(app).get(`/events/${event._id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Single");
  });

  test("get event → not found", async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/events/${id}`);

    expect(res.status).toBe(404);
  });

  test("get event → invalid ID", async () => {
    const res = await request(app).get("/events/invalid-id");

    expect(res.status).toBe(404);
  });

  // ============================================================================
  // GET EVENT STATS
  // ============================================================================
  test("get event stats → success", async () => {
    const user = await User.create({
      name: "Stats",
      email: "stats@test.com",
      password: "hashed",
      role: "admin"
    });

    await Event.create([
      { title: "A", createdBy: user._id },
      { title: "B", createdBy: user._id }
    ]);

    const res = await request(app).get("/events/stats");

    expect(res.status).toBe(200);
    expect(res.body.totalEvents).toBe(2);
    expect(res.body.eventsPerUser.length).toBe(1);
  });
});
