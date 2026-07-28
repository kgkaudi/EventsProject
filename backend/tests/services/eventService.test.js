import { eventService } from "../../src/services/eventService.js";
import Event from "../../src/models/Event.js";
import User from "../../src/models/User.js";

describe("Event Service", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
  });

  test("createEvent → missing user context", async () => {
    await expect(eventService.createEvent({ title: "NoUser" }, null))
      .rejects.toThrow("Missing createdBy or user context");
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
      eventService.updateEvent(event._id, other._id, { title: "Hack" })
    ).rejects.toThrow("Forbidden");
  });

  test("deleteEvent → event not found", async () => {
    const user = await User.create({
      name: "User",
      email: "user@test.com",
      password: "hashed"
    });

    const fakeId = new Event()._id;

    await expect(eventService.deleteEvent(fakeId, user._id))
      .rejects.toThrow("Event not found");
  });

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
