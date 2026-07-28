import { eventService } from "../../src/services/eventService.js";
import Event from "../../src/models/Event.js";
import User from "../../src/models/User.js";

describe("Event Service", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
  });

  // ============================================================================
  // A — CREATE EVENT
  // ============================================================================

  test("createEvent → missing user context", async () => {
    await expect(
      eventService.createEvent({ title: "NoUser" }, null)
    ).rejects.toThrow("Missing createdBy or user context");
  });

  test("createEvent → user not found", async () => {
    const fakeId = new Event()._id; // valid ObjectId

    await expect(
      eventService.createEvent(
        { title: "BadUser", createdBy: fakeId },
        { _id: fakeId }
      )
    ).rejects.toThrow("User not found");
  });

  test("createEvent → invalid user ID format", async () => {
    await expect(
      eventService.createEvent({ title: "Bad" }, { _id: "bad-id" })
    ).rejects.toThrow("Invalid user ID");
  });

  // ============================================================================
  // B — UPDATE EVENT
  // ============================================================================

  test("updateEvent → forbidden", async () => {
    const owner = await User.create({
      name: "Owner",
      email: "owner@test.com",
      password: "hashed"
    });

    const other = await User.create({
      name: "Other",
      email: "other@test.com",
      password: "hashed"
    });

    const event = await Event.create({
      title: "Private",
      createdBy: owner._id
    });

    await expect(
      eventService.updateEvent(event._id, other._id, { title: "Hack" }, "user")
    ).rejects.toThrow("Forbidden");
  });

  test("updateEvent → invalid event ID format", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed"
    });

    await expect(
      eventService.updateEvent("bad-id", user._id, { title: "X" }, "user")
    ).rejects.toThrow("Invalid event ID");
  });

  test("updateEvent → missing user role", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed"
    });

    const event = await Event.create({ title: "E", createdBy: user._id });

    await expect(
      eventService.updateEvent(event._id, user._id, { title: "X" }, undefined)
    ).rejects.toThrow("Missing user role");
  });

  // ============================================================================
  // C — DELETE EVENT
  // ============================================================================

  test("deleteEvent → event not found", async () => {
    const user = await User.create({
      name: "User",
      email: "user@test.com",
      password: "hashed"
    });

    const fakeId = new Event()._id;

    await expect(
      eventService.deleteEvent(fakeId, user._id, "user")
    ).rejects.toThrow("Event not found");
  });

  test("deleteEvent → invalid event ID format", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed"
    });

    await expect(
      eventService.deleteEvent("bad-id", user._id, "user")
    ).rejects.toThrow("Invalid event ID");
  });

  test("deleteEvent → missing user role", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed"
    });

    const event = await Event.create({ title: "E", createdBy: user._id });

    await expect(
      eventService.deleteEvent(event._id, user._id, undefined)
    ).rejects.toThrow("Missing user role");
  });

  // ============================================================================
  // D — GET ALL EVENTS (pagination + search)
  // ============================================================================

  test("getAllEvents → pagination works", async () => {
    const user = await User.create({
      name: "Tester",
      email: "tester@test.com",
      password: "hashed"
    });

    await Event.create([
      { title: "React Meetup", content: "Learn React", createdBy: user._id },
      { title: "Music Fest", content: "Live", createdBy: user._id }
    ]);

    const result = await eventService.getAllEvents({
      page: 1,
      limit: 1,
      q: "react"
    });

    expect(result.events.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  test("getAllEvents → invalid pagination", async () => {
    await expect(
      eventService.getAllEvents({ page: 0, limit: 10 })
    ).rejects.toThrow("Invalid pagination values");
  });

  test("getAllEvents → q is not a string", async () => {
    await expect(
      eventService.getAllEvents({ page: 1, limit: 10, q: ["123"] })
    ).rejects.toThrow("Search query must be a string");
  });

  // ============================================================================
  // E — GET EVENT STATS
  // ============================================================================

  test("getEventStats → returns totals", async () => {
    const user = await User.create({
      name: "Stats",
      email: "stats@test.com",
      password: "hashed"
    });

    await Event.create([
      { title: "A", createdBy: user._id },
      { title: "B", createdBy: user._id }
    ]);

    const stats = await eventService.getEventStats();

    expect(stats.totalEvents).toBe(2);
    expect(stats.eventsPerUser.length).toBe(1);
  });
});
