import { userRepository } from "../../src/repositories/userRepository.js";
import User from "../../src/models/User.js";
import Event from "../../src/models/Event.js";

describe("User Repository", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
  });

  test("findById → success", async () => {
    const user = await User.create({
      name: "RepoUser",
      email: "repo@test.com",
      password: "hashed"
    });

    const found = await userRepository.findById(user._id);

    expect(found.email).toBe("repo@test.com");
  });

  test("findById → not found", async () => {
    const id = new User()._id; // valid ObjectId
    const found = await userRepository.findById(id);
    expect(found).toBeNull();
  });

  test("findAll → returns sorted list", async () => {
    await User.create([
      { name: "A", email: "a@test.com", password: "hashed" },
      { name: "B", email: "b@test.com", password: "hashed" }
    ]);

    const users = await userRepository.findAll();
    expect(users.length).toBe(2);
  });

  test("findByIdAndUpdate → success", async () => {
    const user = await User.create({
      name: "Old",
      email: "old@test.com",
      password: "hashed"
    });

    const updated = await userRepository.findByIdAndUpdate(user._id, {
      name: "New"
    });

    expect(updated.name).toBe("New");
  });

  test("findByIdAndUpdate → not found", async () => {
    const id = new User()._id;
    const updated = await userRepository.findByIdAndUpdate(id, {
      name: "New"
    });

    expect(updated).toBeNull();
  });

  test("findByIdAndDelete → success", async () => {
    const user = await User.create({
      name: "DeleteMe",
      email: "del@test.com",
      password: "hashed"
    });

    const deleted = await userRepository.findByIdAndDelete(user._id);

    expect(deleted.email).toBe("del@test.com");
  });

  test("deleteUserEvents → removes events", async () => {
    const user = await User.create({
      name: "EventUser",
      email: "ev@test.com",
      password: "hashed"
    });

    await Event.create([
      { title: "A", createdBy: user._id },
      { title: "B", createdBy: user._id }
    ]);

    await userRepository.deleteUserEvents(user._id);

    const remaining = await Event.find({ createdBy: user._id });
    expect(remaining.length).toBe(0);
  });
});
