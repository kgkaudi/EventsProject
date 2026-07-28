import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// ============================================================================
// 1. MOCKS (controllers + middleware)
// ============================================================================
jest.unstable_mockModule("../../src/controllers/eventsController.js", () => ({
  getAllEvents: jest.fn(),
  getEvent: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  getMyEvents: jest.fn(),
  getEventStats: jest.fn(),
}));

jest.unstable_mockModule("../../src/middleware/requireAuth.js", () => ({
  default: jest.fn((req, res, next) => {
    req.user = { _id: "mockUser123", role: "user" };
    next();
  }),
}));

jest.unstable_mockModule("../../src/middleware/adminOnly.js", () => ({
  default: jest.fn((req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  }),
}));

// ============================================================================
// 2. IMPORT MOCKED MODULES + ROUTES
// ============================================================================
const eventsController =
  await import("../../src/controllers/eventsController.js");
const requireAuth = (await import("../../src/middleware/requireAuth.js"))
  .default;
const adminOnly = (await import("../../src/middleware/adminOnly.js")).default;

const eventsRoutes = (await import("../../src/routes/eventsRoutes.js")).default;

// ============================================================================
// 3. EXPRESS APP
// ============================================================================
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
  // PUBLIC ROUTES
  // ============================================================================

  test("GET /events → calls getAllEvents", async () => {
    eventsController.getAllEvents.mockImplementation((req, res) =>
      res.status(200).json([{ title: "Event 1" }]),
    );

    const res = await request(app).get("/events");

    expect(res.status).toBe(200);
    expect(eventsController.getAllEvents).toHaveBeenCalled();
  });

  test("GET /events?page=1&limit=10 → does NOT call getEvent", async () => {
    await request(app).get("/events?page=1&limit=10");

    expect(eventsController.getEvent).not.toHaveBeenCalled();
    expect(eventsController.getAllEvents).toHaveBeenCalled();
  });

  // ============================================================================
  // PUBLIC ROUTE: GET /events/:id
  // ============================================================================

  test("GET /events/:id → calls getEvent", async () => {
    eventsController.getEvent.mockImplementation((req, res) =>
      res.status(200).json({ title: "Event 1" }),
    );

    const res = await request(app).get("/events/123");

    expect(res.status).toBe(200);
    expect(eventsController.getEvent).toHaveBeenCalled();
  });

  test("GET /events/:id → does NOT require auth", async () => {
    await request(app).get("/events/123");
    expect(requireAuth).not.toHaveBeenCalled();
  });

  test("GET /events/:id → 404 when not found", async () => {
    eventsController.getEvent.mockImplementation((req, res) =>
      res.status(404).json({ error: "Event not found" }),
    );

    const res = await request(app).get("/events/123");
    expect(res.status).toBe(404);
  });

  test("GET /events/:id → 400 for invalid ID", async () => {
    eventsController.getEvent.mockImplementation((req, res) =>
      res.status(400).json({ error: "Invalid ID" }),
    );

    const res = await request(app).get("/events/invalid-id");
    expect(res.status).toBe(400);
  });

  // ============================================================================
  // AUTH ROUTE: GET /events/mine
  // ============================================================================
  test("GET /events/mine → requires auth and calls getMyEvents", async () => {
    // Simulate authenticated user
    requireAuth.mockImplementationOnce((req, res, next) => {
      req.user = { _id: "mockUser123", role: "user" };
      next();
    });

    eventsController.getMyEvents.mockImplementation((req, res) =>
      res.status(200).json({ ok: true }),
    );

    const res = await request(app).get("/events/mine");

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.getMyEvents).toHaveBeenCalled();
    expect(eventsController.getEvent).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  // ============================================================================
  // ADMIN ROUTE: GET /events/stats
  // ============================================================================

  test("GET /events/stats → requires both requireAuth and adminOnly", async () => {
    await request(app).get("/events/stats");

    expect(requireAuth).toHaveBeenCalled();
    expect(adminOnly).toHaveBeenCalled();
  });

  test("GET /events/stats → 403 for non-admin", async () => {
    const res = await request(app).get("/events/stats");
    expect(res.status).toBe(403);
  });

  test("GET /events/stats → does NOT call getEvent", async () => {
    requireAuth.mockImplementationOnce((req, res, next) => {
      req.user = { _id: "u", role: "admin" };
      next();
    });

    eventsController.getEventStats.mockImplementation((req, res) =>
      res.status(200).json({ ok: true }),
    );

    await request(app).get("/events/stats");

    expect(eventsController.getEvent).not.toHaveBeenCalled();
    expect(eventsController.getEventStats).toHaveBeenCalled();
  });

  test("GET /events/stats → 500 on controller error", async () => {
    requireAuth.mockImplementationOnce((req, res, next) => {
      req.user = { _id: "mockUser123", role: "admin" };
      next();
    });

    eventsController.getEventStats.mockImplementation(() => {
      throw new Error("Stats error");
    });

    const res = await request(app).get("/events/stats");
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/stats error/i);
  });

  // ============================================================================
  // POST /events
  // ============================================================================

  test("POST /events → requires auth", async () => {
    eventsController.createEvent.mockImplementation((req, res) =>
      res.status(201).json({ message: "Created" }),
    );

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer token")
      .send({ title: "Test" });

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.createEvent).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  test("POST /events → 400 for missing fields", async () => {
    eventsController.createEvent.mockImplementation((req, res) =>
      res.status(400).json({ error: "Missing required fields" }),
    );

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer token")
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  test("POST /events → 500 on controller error", async () => {
    eventsController.createEvent.mockImplementation(() => {
      throw new Error("Create error");
    });

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer token")
      .send({ title: "Test" });

    expect(res.status).toBe(500);
  });

  test("POST /events → does NOT call getEvent", async () => {
    await request(app).post("/events").send({ title: "X" });

    expect(eventsController.getEvent).not.toHaveBeenCalled();
    expect(eventsController.createEvent).toHaveBeenCalled();
  });

  // ============================================================================
  // PUT /events/:id
  // ============================================================================

  test("PUT /events/:id → requires auth", async () => {
    eventsController.updateEvent.mockImplementation((req, res) =>
      res.status(200).json({ title: "Updated" }),
    );

    const res = await request(app)
      .put("/events/123")
      .set("Authorization", "Bearer token")
      .send({ title: "Updated" });

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.updateEvent).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  test("PUT /events/:id → 404 when event not found", async () => {
    eventsController.updateEvent.mockImplementation((req, res) =>
      res.status(404).json({ error: "Event not found" }),
    );

    const res = await request(app)
      .put("/events/123")
      .set("Authorization", "Bearer token")
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });

  test("PUT /events/:id → 403 when user not owner", async () => {
    eventsController.updateEvent.mockImplementation((req, res) =>
      res.status(403).json({ error: "Forbidden" }),
    );

    const res = await request(app)
      .put("/events/123")
      .set("Authorization", "Bearer token")
      .send({ title: "Updated" });

    expect(res.status).toBe(403);
  });

  test("PUT /events/:id → does NOT call getAllEvents", async () => {
    await request(app).put("/events/123").send({ title: "X" });

    expect(eventsController.getAllEvents).not.toHaveBeenCalled();
    expect(eventsController.updateEvent).toHaveBeenCalled();
  });

  // ============================================================================
  // DELETE /events/:id
  // ============================================================================

  test("DELETE /events/:id → requires auth", async () => {
    eventsController.deleteEvent.mockImplementation((req, res) =>
      res.status(200).json({ message: "Deleted" }),
    );

    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", "Bearer token");

    expect(requireAuth).toHaveBeenCalled();
    expect(eventsController.deleteEvent).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  test("DELETE /events/:id → 404 when event not found", async () => {
    eventsController.deleteEvent.mockImplementation((req, res) =>
      res.status(404).json({ error: "Event not found" }),
    );

    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  test("DELETE /events/:id → 403 when user not owner", async () => {
    eventsController.deleteEvent.mockImplementation((req, res) =>
      res.status(403).json({ error: "Forbidden" }),
    );

    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(403);
  });

  test("DELETE /events/:id → does NOT call getAllEvents", async () => {
    await request(app).delete("/events/123");

    expect(eventsController.getAllEvents).not.toHaveBeenCalled();
    expect(eventsController.deleteEvent).toHaveBeenCalled();
  });
});
