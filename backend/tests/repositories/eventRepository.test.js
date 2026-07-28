import { eventRepository } from "../../src/repositories/eventRepository.js";
import Event from "../../src/models/Event.js";
import User from "../../src/models/User.js";

describe("Event Repository", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
  });

  // ============================================================================
  // CREATE
  // ============================================================================
  test("create → success", async () => {
    const user = await User.create({
      name: "RepoUser",
      email: "repo@test.com",
      password: "hashed",
    });

    const event = await eventRepository.create({
      title: "Repo Event",
      content: "Testing",
      createdBy: user._id,
    });

    expect(event.title).toBe("Repo Event");
    expect(event.createdBy.toString()).toBe(user._id.toString());
  });

  // ============================================================================
  // READ: findById
  // ============================================================================
  test("findById → not found", async () => {
    const id = new Event()._id; // valid ObjectId
    const event = await eventRepository.findById(id);
    expect(event).toBeNull();
  });

  // ============================================================================
  // READ: findAll + pagination + filtering
  // ============================================================================
  test("findAll → pagination + filtering", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed",
    });

    await Event.create([
      { title: "React Meetup", createdBy: user._id },
      { title: "Music Fest", createdBy: user._id },
      { title: "React Workshop", createdBy: user._id },
    ]);

    const events = await eventRepository.findAll(
      { title: /react/i },
      { skip: 0, limit: 2 },
    );

    expect(events.length).toBe(2);
    expect(events[0].title.toLowerCase()).toContain("react");
  });

  // ============================================================================
  // READ: count
  // ============================================================================
  test("count → filtered count", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed",
    });

    await Event.create([
      { title: "React Meetup", createdBy: user._id },
      { title: "Music Fest", createdBy: user._id },
    ]);

    const total = await eventRepository.count({ title: /react/i });
    expect(total).toBe(1);
  });

  // ============================================================================
  // UPDATE
  // ============================================================================
  test("update → modifies fields", async () => {
    const user = await User.create({
      name: "Updater",
      email: "up@test.com",
      password: "hashed",
    });

    const event = await Event.create({
      title: "Old",
      createdBy: user._id,
    });

    const updated = await eventRepository.update(event, { title: "New" });

    expect(updated.title).toBe("New");
  });

  test("update → no changes", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed",
    });

    const event = await Event.create({ title: "Old", createdBy: user._id });

    const updated = await eventRepository.update(event, {});
    expect(updated.title).toBe("Old");
  });

  // ============================================================================
  // DELETE
  // ============================================================================
  test("delete → removes event", async () => {
    const user = await User.create({
      name: "Deleter",
      email: "del@test.com",
      password: "hashed",
    });

    const event = await Event.create({
      title: "ToDelete",
      createdBy: user._id,
    });

    await eventRepository.delete(event);

    const exists = await Event.findById(event._id);
    expect(exists).toBeNull();
  });

  test("delete → deleting twice does not throw", async () => {
    const user = await User.create({
      name: "U",
      email: "u@test.com",
      password: "hashed",
    });

    const event = await Event.create({ title: "X", createdBy: user._id });

    await eventRepository.delete(event);
    await expect(eventRepository.delete(event)).resolves.not.toThrow();
  });

  // ============================================================================
  // AGGREGATE STATS
  // ============================================================================
  test("aggregateStats → returns totals", async () => {
    const user = await User.create({
      name: "Stats",
      email: "stats@test.com",
      password: "hashed",
    });

    await Event.create([
      { title: "A", createdBy: user._id },
      { title: "B", createdBy: user._id },
    ]);

    const stats = await eventRepository.aggregateStats();

    expect(stats.totalEvents).toBe(2);
    expect(stats.eventsPerUser.length).toBe(1);
  });

  test("aggregateStats → empty database", async () => {
    const stats = await eventRepository.aggregateStats();
    expect(stats.totalEvents).toBe(0);
    expect(stats.eventsPerUser.length).toBe(0);
  });
});
