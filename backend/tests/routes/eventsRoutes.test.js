import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 1. Mock controllers BEFORE importing routes
jest.unstable_mockModule("../../src/controllers/eventsController.js", () => ({
  getAllEvents: jest.fn(),
  getEvent: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  getMyEvents: jest.fn()
}));

// 2. Mock auth middleware BEFORE importing routes
jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => {
    req.user = { _id: "mockUser123" }; // inject fake authenticated user
    next();
  })
}));

// 3. Import mocked modules
const eventsController = await import("../../src/controllers/eventsController.js");
const requireAuth = (await import("../../src/middleware/requireAuth.js")).default;

// 4. Import routes AFTER mocks
const eventsRoutes = (await import("../../src/routes/eventsRoutes.js")).default;

// 5. Build app AFTER importing routes
const app = express();
app.use(express.json());
app.use("/events", eventsRoutes);

describe("Events Routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /events calls getAllEvents", async () => {
    eventsController.getAllEvents.mockImplementation((req, res) =>
      res.status(200).json([{ title: "Event 1" }])
    );

    const res = await request(app).get("/events");

    expect(res.status).toBe(200);
    expect(eventsController.getAllEvents).toHaveBeenCalled();
  });

  test("GET /events/:id calls getEvent", async () => {
    eventsController.getEvent.mockImplementation((req, res) =>
      res.status(200).json({ title: "Event 1" })
    );

    const res = await request(app).get("/events/123");

    expect(res.status).toBe(200);
    expect(eventsController.getEvent).toHaveBeenCalled();
  });

  test("POST /events requires auth", async () => {
    eventsController.createEvent.mockImplementation((req, res) =>
      res.status(201).json({ message: "Created" })
    );

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer token")
      .send({
        title: "Test",
        content: "Content",
        location: "Athens",
        maxcapacity: 50,
        date: "2025-01-01"
      });

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.createEvent).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  test("PUT /events/:id requires auth", async () => {
    eventsController.updateEvent.mockImplementation((req, res) =>
      res.status(200).json({ title: "Updated" })
    );

    const res = await request(app)
      .put("/events/123")
      .set("Authorization", "Bearer token")
      .send({ title: "Updated" });

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.updateEvent).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  test("DELETE /events/:id requires auth", async () => {
    eventsController.deleteEvent.mockImplementation((req, res) =>
      res.status(200).json({ message: "Deleted" })
    );

    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", "Bearer token");

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.deleteEvent).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
