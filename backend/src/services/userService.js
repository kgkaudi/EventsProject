import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

export const userService = {
  //
  // LOGIN (name OR email)
  //
  async login(identifier, password) {
    // identifier = name OR email
    const user = await userRepository.login(identifier, password);
    const token = createToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  //
  // SIGNUP
  //
  async signup(name, email, password, role) {
    const user = await userRepository.signup(name, email, password, role);
    const token = createToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  //
  // GET ALL USERS
  //
  async getUsers() {
    return userRepository.findAll();
  },

  //
  // GET USER BY ID
  //
  async getUser(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  },

  //
  // UPDATE USER (name/email/role)
  //
  async updateUser(id, updates) {
    delete updates.password;

    const user = await userRepository.findByIdAndUpdate(id, updates);
    if (!user) throw new Error("User not found");

    return user;
  },

  //
  // UPDATE PASSWORD
  //
  async updatePassword(id, password, newPassword) {
    if (!password || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("New Password is not strong enough");
    }

    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect current password");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password updated successfully" };
  },

  //
  // DELETE USER (admin deletes another user)
  //
  async deleteUser(adminId, userId, password) {
    if (!password) throw new Error("Password is required");

    const admin = await userRepository.findById(adminId);
    if (!admin) throw new Error("Unauthorized");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Incorrect password");

    const deletedUser = await userRepository.findByIdAndDelete(userId);
    if (!deletedUser) throw new Error("User not found");

    await userRepository.deleteUserEvents(userId);

    return {
      message: "User and all associated events were deleted successfully",
    };
  },

  //
  // UPDATE ROLE
  //
  async updateRole(id, role) {
    if (!["user", "admin"].includes(role)) {
      throw new Error("Invalid role");
    }

    const updated = await userRepository.updateRole(id, role);
    if (!updated) throw new Error("User not found");

    return updated;
  },
};
