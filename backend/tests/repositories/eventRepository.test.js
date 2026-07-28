import { eventRepository } from "../../src/repositories/eventRepository.js";
import Event from "../../src/models/Event.js";
import User from "../../src/models/User.js";

describe("Event Repository", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
  });

  test("create → success", async () => {
    const user = await User.create({
      name: "RepoUser",
      email: "repo@test.com",
      password: "hashed"
    });

    const event = await eventRepository.create({
      title: "Repo Event",
      content: "Testing",
      createdBy: user._id,
    });

    expect(event.title).toBe("Repo Event");
    expect(event.createdBy.toString()).toBe(user._id.toString());
  });

  test("findById → not found", async () => {
    const id = new Event()._id; // valid ObjectId
    const event = await eventRepository.findById(id);
    expect(event).toBeNull();
  });

  test("update → modifies fields", async () => {
    const user = await User.create({
      name: "Updater",
      email: "up@test.com",
      password: "hashed"
    });

    const event = await Event.create({
      title: "Old",
      createdBy: user._id
    });

    const updated = await eventRepository.update(event, { title: "New" });

    expect(updated.title).toBe("New");
  });

  test("delete → removes event", async () => {
    const user = await User.create({
      name: "Deleter",
      email: "del@test.com",
      password: "hashed"
    });

    const event = await Event.create({
      title: "ToDelete",
      createdBy: user._id
    });

    await eventRepository.delete(event);

    const exists = await Event.findById(event._id);
    expect(exists).toBeNull();
  });

  test("aggregateStats → returns totals", async () => {
    const user = await User.create({
      name: "Stats",
      email: "stats@test.com",
      password: "hashed"
    });

    await Event.create([
      { title: "A", createdBy: user._id },
      { title: "B", createdBy: user._id }
    ]);

    const stats = await eventRepository.aggregateStats();

    expect(stats.totalEvents).toBe(2);
    expect(stats.eventsPerUser.length).toBe(1);
  });
});
