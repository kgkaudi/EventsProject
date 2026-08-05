import { userRepository } from "../../src/repositories/userRepository.js";
import User from "../../src/models/User.js";
import Event from "../../src/models/Event.js";
import bcrypt from "bcryptjs";

describe("User Repository", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Event.deleteMany();
  });

  // ============================================================================
  // FIND BY ID
  // ============================================================================
  test("findById → success", async () => {
    const user = await User.create({
      name: "RepoUser",
      email: "repo@test.com",
      password: "hashed",
    });

    const found = await userRepository.findById(user._id);

    expect(found.email).toBe("repo@test.com");
  });

  test("findById → not found", async () => {
    const id = new User()._id;
    const found = await userRepository.findById(id);
    expect(found).toBeNull();
  });

  // ============================================================================
  // FIND ALL
  // ============================================================================
  test("findAll → returns sorted by createdAt desc", async () => {
    const u1 = await User.create({
      name: "A",
      email: "a@test.com",
      password: "hashed",
    });
    const u2 = await User.create({
      name: "B",
      email: "b@test.com",
      password: "hashed",
    });

    const users = await userRepository.findAll();

    expect(users[0]._id.toString()).toBe(u2._id.toString());
    expect(users[1]._id.toString()).toBe(u1._id.toString());
  });

  test("findAll → empty list", async () => {
    const users = await userRepository.findAll();
    expect(users).toEqual([]);
  });

  // ============================================================================
  // UPDATE USER
  // ============================================================================
  test("findByIdAndUpdate → success", async () => {
    const user = await User.create({
      name: "Old",
      email: "old@test.com",
      password: "hashed",
    });

    const updated = await userRepository.findByIdAndUpdate(user._id, {
      name: "New",
    });

    expect(updated.name).toBe("New");
  });

  test("findByIdAndUpdate → not found", async () => {
    const id = new User()._id;
    const updated = await userRepository.findByIdAndUpdate(id, {
      name: "New",
    });

    expect(updated).toBeNull();
  });

  test("findByIdAndUpdate → invalid ID format throws", async () => {
    await expect(
      userRepository.findByIdAndUpdate("bad-id", { name: "X" }),
    ).rejects.toThrow();
  });

  // ============================================================================
  // DELETE USER
  // ============================================================================
  test("findByIdAndDelete → success", async () => {
    const user = await User.create({
      name: "DeleteMe",
      email: "del@test.com",
      password: "hashed",
    });

    const deleted = await userRepository.findByIdAndDelete(user._id);

    expect(deleted.email).toBe("del@test.com");
  });

  test("findByIdAndDelete → invalid ID format throws", async () => {
    await expect(userRepository.findByIdAndDelete("bad-id")).rejects.toThrow();
  });

  // ============================================================================
  // DELETE USER EVENTS
  // ============================================================================
  test("deleteUserEvents → removes events", async () => {
    const user = await User.create({
      name: "EventUser",
      email: "ev@test.com",
      password: "hashed",
    });

    await Event.create([
      { title: "A", createdBy: user._id },
      { title: "B", createdBy: user._id },
    ]);

    await userRepository.deleteUserEvents(user._id);

    const remaining = await Event.find({ createdBy: user._id });
    expect(remaining.length).toBe(0);
  });

  test("deleteUserEvents → invalid ID format throws", async () => {
    await expect(userRepository.deleteUserEvents("bad-id")).rejects.toThrow();
  });

  test("deleteUserEvents → no events does not throw", async () => {
    const user = await User.create({
      name: "NoEvents",
      email: "no@test.com",
      password: "hashed",
    });

    await expect(
      userRepository.deleteUserEvents(user._id),
    ).resolves.not.toThrow();
  });

  // ============================================================================
  // LOGIN (name OR email)
  // ============================================================================
  test("login → success using email", async () => {
    const hashed = await bcrypt.hash("123456", 10);

    await User.create({
      name: "LoginUser",
      email: "login@test.com",
      password: hashed,
    });

    const user = await userRepository.login("login@test.com", "123456");

    expect(user.email).toBe("login@test.com");
  });

  test("login → success using name", async () => {
    const hashed = await bcrypt.hash("123456", 10);

    await User.create({
      name: "LoginName",
      email: "name@test.com",
      password: hashed,
    });

    const user = await userRepository.login("LoginName", "123456");

    expect(user.name).toBe("LoginName");
  });

  test("login → incorrect identifier throws", async () => {
    const hashed = await bcrypt.hash("123456", 10);

    await User.create({
      name: "UserX",
      email: "x@test.com",
      password: hashed,
    });

    await expect(
      userRepository.login("WrongName", "123456"),
    ).rejects.toThrow("Incorrect name or email");
  });

  test("login → incorrect password throws", async () => {
    const hashed = await bcrypt.hash("123456", 10);

    await User.create({
      name: "UserY",
      email: "y@test.com",
      password: hashed,
    });

    await expect(
      userRepository.login("UserY", "wrongpass"),
    ).rejects.toThrow("Incorrect password");
  });
});
