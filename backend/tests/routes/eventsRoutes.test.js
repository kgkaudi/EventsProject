import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// -----------------------------
// 1. Mock controllers BEFORE importing routes
// -----------------------------
jest.unstable_mockModule("../../src/controllers/eventsController.js", () => ({
  getAllEvents: jest.fn(),
  getEvent: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  getMyEvents: jest.fn(),
  getEventStats: jest.fn()
}));

// -----------------------------
// 2. Mock requireAuth BEFORE importing routes
// -----------------------------
jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => {
    req.user = { _id: "mockUser123", role: "user" };
    next();
  })
}));

// -----------------------------
// 3. Mock adminOnly BEFORE importing routes
// -----------------------------
jest.unstable_mockModule("../../src/middleware/adminOnly.js", () => ({
  default: jest.fn((req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  })
}));

// -----------------------------
// 4. Import mocked modules
// -----------------------------
const eventsController = await import("../../src/controllers/eventsController.js");
const requireAuth = (await import("../../src/middleware/requireAuth.js")).default;
const adminOnly = (await import("../../src/middleware/adminOnly.js")).default;

// -----------------------------
// 5. Import routes AFTER mocks
// -----------------------------
const eventsRoutes = (await import("../../src/routes/eventsRoutes.js")).default;

// -----------------------------
// 6. Build express app
// -----------------------------
const app = express();
app.use(express.json());
app.use("/events", eventsRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// ============================================================================
// TEST SUITE
// ============================================================================
describe("Events Routes (Success + Edge Cases)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================================================
  // SUCCESS CASES
  // ============================================================================

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

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  // GET /events
  test("GET /events returns 500 on controller error", async () => {
    eventsController.getAllEvents.mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await request(app).get("/events");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/db error/i);
  });

  // GET /events/:id
  test("GET /events/:id returns 404 when event not found", async () => {
    eventsController.getEvent.mockImplementation((req, res) =>
      res.status(404).json({ error: "Event not found" })
    );

    const res = await request(app).get("/events/123");

    expect(res.status).toBe(404);
  });

  test("GET /events/:id returns 400 for invalid ID", async () => {
    eventsController.getEvent.mockImplementation((req, res) =>
      res.status(400).json({ error: "Invalid ID" })
    );

    const res = await request(app).get("/events/invalid-id");

    expect(res.status).toBe(400);
  });

  // GET /events/stats (admin only)
  test("GET /events/stats returns 403 for non-admin", async () => {
    const res = await request(app)
      .get("/events/stats")
      .set("Authorization", "Bearer token");

    expect(adminOnly).toHaveBeenCalled();
    expect(res.status).toBe(403);
  });

  test("GET /events/stats returns 500 on controller error", async () => {
    // Make user admin
    requireAuth.mockImplementationOnce((req, res, next) => {
      req.user = { _id: "mockUser123", role: "admin" };
      next();
    });

    eventsController.getEventStats.mockImplementation(() => {
      throw new Error("Stats error");
    });

    const res = await request(app)
      .get("/events/stats")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/stats error/i);
  });

  // POST /events
  test("POST /events returns 400 for missing fields", async () => {
    eventsController.createEvent.mockImplementation((req, res) =>
      res.status(400).json({ error: "Missing required fields" })
    );

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer token")
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  test("POST /events returns 500 on controller error", async () => {
    eventsController.createEvent.mockImplementation(() => {
      throw new Error("Create error");
    });

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

    expect(res.status).toBe(500);
  });

  // PUT /events/:id
  test("PUT /events/:id returns 404 when event not found", async () => {
    eventsController.updateEvent.mockImplementation((req, res) =>
      res.status(404).json({ error: "Event not found" })
    );

    const res = await request(app)
      .put("/events/123")
      .set("Authorization", "Bearer token")
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });

  test("PUT /events/:id returns 403 when user not owner", async () => {
    eventsController.updateEvent.mockImplementation((req, res) =>
      res.status(403).json({ error: "Forbidden" })
    );

    const res = await request(app)
      .put("/events/123")
      .set("Authorization", "Bearer token")
      .send({ title: "Updated" });

    expect(res.status).toBe(403);
  });

  // DELETE /events/:id
  test("DELETE /events/:id returns 404 when event not found", async () => {
    eventsController.deleteEvent.mockImplementation((req, res) =>
      res.status(404).json({ error: "Event not found" })
    );

    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  test("DELETE /events/:id returns 403 when user not owner", async () => {
    eventsController.deleteEvent.mockImplementation((req, res) =>
      res.status(403).json({ error: "Forbidden" })
    );

    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(403);
  });
});
