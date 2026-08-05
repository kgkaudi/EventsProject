// backend/src/repositories/userRepository.js
import User from "../models/User.js";
import Event from "../models/Event.js";

export const userRepository = {
  async findById(id) {
    return User.findById(id);
  },

  async findAll() {
    return User.find().sort({ createdAt: -1 });
  },

  async findByIdAndUpdate(id, updates) {
    return User.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });
  },

  async findByIdAndDelete(id) {
    return User.findByIdAndDelete(id);
  },

  async deleteUserEvents(userId) {
    return Event.deleteMany({ createdBy: userId });
  },

  async updateRole(id, role) {
    return User.findByIdAndUpdate(id, { role }, { returnDocument: "after" });
  },

  async login(identifier, password) {
    return User.login(identifier, password);
  },

  async signup(name, email, password, role) {
    return User.signup(name, email, password, role);
  },
};
