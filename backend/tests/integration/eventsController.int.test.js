import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";

process.env.SECRET = "testsecret";

jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => next()),
}));

// Import AFTER mocks
const eventsRoutes = (await import("../../src/routes/eventsRoutes.js")).default;
const User = (await import("../../src/models/User.js")).default;
const Event = (await import("../../src/models/Event.js")).default;
const requireAuth = (await import("../../src/middleware/requireAuth.js"))
  .default;

const app = express();
app.use(express.json());
app.use("/events", eventsRoutes);

describe("Events Controller Integration", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
    jest.clearAllMocks();
  });

  test("create event", async () => {
    const user = await User.create({
      name: "Kostas",
      email: "kostas@test.com",
      password: "hashed",
      role: "user",
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer faketoken")
      .send({
        title: "My Event",
        content: "Content",
        location: "Athens",
        maxcapacity: 50,
        date: "2025-01-01",
        categories: ["tech"],
        tags: ["react"],
        createdBy: user._id.toString(),
      });

    expect(res.status).toBe(201);

    const events = await Event.find();
    expect(events.length).toBe(1);
    expect(events[0].title).toBe("My Event");
  });

  test("update event", async () => {
    const user = await User.create({
      name: "Owner",
      email: "owner@test.com",
      password: "hashed",
      role: "user",
    });

    const event = await Event.create({
      title: "Old",
      content: "C",
      location: "Athens",
      maxcapacity: 10,
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: user._id,
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    const res = await request(app)
      .put(`/events/${event._id}`)
      .set("Authorization", "Bearer faketoken")
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
  });

  test("delete event", async () => {
    const user = await User.create({
      name: "Owner",
      email: "owner2@test.com",
      password: "hashed",
      role: "user",
    });

    const event = await Event.create({
      title: "Delete",
      content: "C",
      location: "Athens",
      maxcapacity: 10,
      date: "2025-01-01",
      categories: ["tech"],
      tags: ["react"],
      createdBy: user._id,
    });

    requireAuth.mockImplementation((req, res, next) => {
      req.user = { _id: user._id.toString() };
      next();
    });

    const res = await request(app)
      .delete(`/events/${event._id}`)
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(200);

    const exists = await Event.findById(event._id);
    expect(exists).toBeNull();
  });
  
  test("get events with pagination and unified search", async () => {
    const user = await User.create({
      name: "Tester",
      email: "tester@test.com",
      password: "hashed",
      role: "user",
    });

    await Event.create([
      {
        title: "React Meetup",
        content: "Learn React",
        location: "Gothenburg",
        date: "2025-01-01",
        categories: ["tech"],
        tags: ["react"],
        createdBy: user._id,
      },
      {
        title: "Music Festival",
        content: "Live music",
        location: "Stockholm",
        date: "2025-01-02",
        categories: ["music"],
        tags: ["festival"],
        createdBy: user._id,
      },
    ]);

    const res = await request(app)
      .get("/events?page=1&limit=1&q=react")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(200);

    // Pagination
    expect(res.body.events.length).toBe(1);
    expect(res.body.total).toBe(1);
    expect(res.body.hasMore).toBe(false);

    // Correct event returned
    const event = res.body.events[0];
    expect(event.title).toBe("React Meetup");

    // Populated createdBy
    expect(event.createdBy.name).toBe("Tester");
  });
});
