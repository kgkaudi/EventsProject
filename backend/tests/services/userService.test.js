import { jest } from "@jest/globals";

// -------------------------------------------------------
// 1. Mock repository BEFORE importing service
// -------------------------------------------------------
jest.unstable_mockModule("../../src/repositories/userRepository.js", () => ({
  userRepository: {
    login: jest.fn(),
    signup: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteUserEvents: jest.fn(),
    updateRole: jest.fn(),
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule("validator", () => ({
  default: {
    isStrongPassword: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

// -------------------------------------------------------
// 2. Import mocks
// -------------------------------------------------------
const { userRepository } =
  await import("../../src/repositories/userRepository.js");
const bcrypt = (await import("bcryptjs")).default;
const validator = (await import("validator")).default;
const jwt = (await import("jsonwebtoken")).default;

// -------------------------------------------------------
// 3. Import service AFTER mocks
// -------------------------------------------------------
const { userService } = await import("../../src/services/userService.js");

// ============================================================================
// TEST SUITE — SORTED BY FUNCTIONALITY
// ============================================================================
describe("User Service (Success + Edge Cases)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================================================
  // LOGIN
  // ============================================================================
  test("login → success", async () => {
    userRepository.login.mockResolvedValue({
      _id: "123",
      name: "Kostas",
      email: "a@a.com",
      role: "user",
    });

    jwt.sign.mockReturnValue("token123");

    const result = await userService.login("a@a.com", "123");

    expect(result.token).toBe("token123");
    expect(result.user.id).toBe("123");
  });

  test("login → error", async () => {
    userRepository.login.mockRejectedValue(new Error("Login failed"));
    await expect(userService.login("a@a.com", "123")).rejects.toThrow(
      "Login failed",
    );
  });

  // ============================================================================
  // SIGNUP
  // ============================================================================
  test("signup → success", async () => {
    userRepository.signup.mockResolvedValue({
      _id: "123",
      name: "Kostas",
      email: "a@a.com",
      role: "user",
    });

    jwt.sign.mockReturnValue("token123");

    const result = await userService.signup(
      "Kostas",
      "a@a.com",
      "StrongPass123!",
      "user",
    );

    expect(result.token).toBe("token123");
  });

  test("signup → error", async () => {
    userRepository.signup.mockRejectedValue(new Error("Signup failed"));
    await expect(
      userService.signup("A", "a@a.com", "123", "user"),
    ).rejects.toThrow("Signup failed");
  });

  // ============================================================================
  // GET USERS
  // ============================================================================
  test("getUsers → empty list", async () => {
    userRepository.findAll.mockResolvedValue([]);
    const users = await userService.getUsers();
    expect(users).toEqual([]);
  });

  test("getUsers → repository error", async () => {
    userRepository.findAll.mockRejectedValue(new Error("DB error"));
    await expect(userService.getUsers()).rejects.toThrow("DB error");
  });

  // ============================================================================
  // GET USER BY ID
  // ============================================================================
  test("getUser → success", async () => {
    userRepository.findById.mockResolvedValue({ name: "Kostas" });
    const user = await userService.getUser("123");
    expect(user.name).toBe("Kostas");
  });

  test("getUser → not found", async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(userService.getUser("123")).rejects.toThrow("User not found");
  });

  // ============================================================================
  // UPDATE USER
  // ============================================================================
  test("updateUser → success", async () => {
    userRepository.findByIdAndUpdate.mockResolvedValue({ name: "New" });
    const updated = await userService.updateUser("123", { name: "New" });
    expect(updated.name).toBe("New");
  });

  test("updateUser → not found", async () => {
    userRepository.findByIdAndUpdate.mockResolvedValue(null);
    await expect(userService.updateUser("123", {})).rejects.toThrow(
      "User not found",
    );
  });

  // ============================================================================
  // UPDATE PASSWORD
  // ============================================================================
  test("updatePassword → missing fields", async () => {
    await expect(userService.updatePassword("123", null, null)).rejects.toThrow(
      "Current password and new password are required",
    );
  });

  test("updatePassword → weak password", async () => {
    validator.isStrongPassword.mockReturnValue(false);
    await expect(
      userService.updatePassword("123", "old", "weak"),
    ).rejects.toThrow("New Password is not strong enough");
  });

  test("updatePassword → user not found", async () => {
    validator.isStrongPassword.mockReturnValue(true);
    userRepository.findById.mockResolvedValue(null);
    await expect(
      userService.updatePassword("123", "old", "StrongPass123!"),
    ).rejects.toThrow("User not found");
  });

  test("updatePassword → wrong current password", async () => {
    validator.isStrongPassword.mockReturnValue(true);
    userRepository.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      userService.updatePassword("123", "wrong", "StrongPass123!"),
    ).rejects.toThrow("Incorrect current password");
  });

  test("updatePassword → success", async () => {
    validator.isStrongPassword.mockReturnValue(true);
    userRepository.findById.mockResolvedValue({
      password: "hashed",
      save: jest.fn(),
    });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newhash");

    const result = await userService.updatePassword(
      "123",
      "old",
      "StrongPass123!",
    );
    expect(result.message).toBe("Password updated successfully");
  });

  test("updatePassword → hashing fails", async () => {
    validator.isStrongPassword.mockReturnValue(true);
    userRepository.findById.mockResolvedValue({
      password: "hashed",
      save: jest.fn(),
    });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockRejectedValue(new Error("Hash error"));

    await expect(
      userService.updatePassword("123", "old", "StrongPass123!"),
    ).rejects.toThrow("Hash error");
  });

  test("updatePassword → save fails", async () => {
    validator.isStrongPassword.mockReturnValue(true);
    userRepository.findById.mockResolvedValue({
      password: "hashed",
      save: jest.fn().mockRejectedValue(new Error("Save error")),
    });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newhash");

    await expect(
      userService.updatePassword("123", "old", "StrongPass123!"),
    ).rejects.toThrow("Save error");
  });

  // ============================================================================
  // DELETE USER
  // ============================================================================
  test("deleteUser → missing password", async () => {
    await expect(userService.deleteUser("admin", "123", null)).rejects.toThrow(
      "Password is required",
    );
  });

  test("deleteUser → admin not found", async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(
      userService.deleteUser("admin", "123", "pass"),
    ).rejects.toThrow("Unauthorized");
  });

  test("deleteUser → wrong admin password", async () => {
    userRepository.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      userService.deleteUser("admin", "123", "wrong"),
    ).rejects.toThrow("Incorrect password");
  });

  test("deleteUser → user not found", async () => {
    userRepository.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    userRepository.findByIdAndDelete.mockResolvedValue(null);

    await expect(
      userService.deleteUser("admin", "123", "pass"),
    ).rejects.toThrow("User not found");
  });

  test("deleteUser → success", async () => {
    userRepository.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    userRepository.findByIdAndDelete.mockResolvedValue({ _id: "123" });
    userRepository.deleteUserEvents.mockResolvedValue({});

    const result = await userService.deleteUser("admin", "123", "pass");
    expect(result.message).toBe(
      "User and all associated events were deleted successfully",
    );
  });

  test("deleteUser → deleteUserEvents fails", async () => {
    userRepository.findById.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    userRepository.findByIdAndDelete.mockResolvedValue({ _id: "123" });
    userRepository.deleteUserEvents.mockRejectedValue(
      new Error("Event delete failed"),
    );

    await expect(
      userService.deleteUser("admin", "123", "pass"),
    ).rejects.toThrow("Event delete failed");
  });

  // ============================================================================
  // UPDATE ROLE
  // ============================================================================
  test("updateRole → invalid role", async () => {
    await expect(userService.updateRole("123", "invalid")).rejects.toThrow(
      "Invalid role",
    );
  });

  test("updateRole → not found", async () => {
    userRepository.updateRole.mockResolvedValue(null);
    await expect(userService.updateRole("123", "admin")).rejects.toThrow(
      "User not found",
    );
  });

  test("updateRole → success", async () => {
    userRepository.updateRole.mockResolvedValue({ _id: "123", role: "admin" });
    const updated = await userService.updateRole("123", "admin");
    expect(updated.role).toBe("admin");
  });

  test("updateRole → repository error", async () => {
    userRepository.updateRole.mockRejectedValue(new Error("DB error"));
    await expect(userService.updateRole("123", "admin")).rejects.toThrow(
      "DB error",
    );
  });
});
