import mongoose from "mongoose";
import { eventRepository } from "../repositories/eventRepository.js";
import { userRepository } from "../repositories/userRepository.js";

export const eventService = {
  async getAllEvents(queryParams) {
    // Validate pagination
    const rawPage = Number(queryParams.page);
    const rawLimit = Number(queryParams.limit);

    const page = isNaN(rawPage) ? 1 : rawPage;
    const limit = isNaN(rawLimit) ? 9 : rawLimit;

    if (page < 1 || limit < 1) {
      throw new Error("Invalid pagination values");
    }

    const skip = (page - 1) * limit;

    // Validate search query
    const { q } = queryParams;
    const query = {};

    if (q) {
      if (typeof q !== "string") {
        throw new Error("Search query must be a string");
      }

      const words = q.trim().split(/\s+/);
      query.$and = words.map((word) => ({
        $or: [
          { title: { $regex: word, $options: "i" } },
          { content: { $regex: word, $options: "i" } },
          { categories: { $regex: word, $options: "i" } },
          { tags: { $regex: word, $options: "i" } },
          { location: { $regex: word, $options: "i" } },
        ],
      }));
    }

    const events = await eventRepository.findAll(query, { skip, limit });
    const total = await eventRepository.count(query);

    return {
      events,
      total,
      hasMore: page * limit < total,
    };
  },

  async getMyEvents(userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    return eventRepository.findByUser(userId);
  },

  async createEvent(data, userContext) {
    const userId = userContext?._id || data.createdBy;
    if (!userId) throw new Error("Missing createdBy or user context");

    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    return eventRepository.create({ ...data, createdBy: user._id });
  },

  async updateEvent(eventId, userId, data, userRole) {
    if (!mongoose.isValidObjectId(eventId)) {
      throw new Error("Invalid event ID");
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }
    if (!userRole) {
      throw new Error("Missing user role");
    }

    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    const isOwner = event.createdBy._id.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden");
    }

    return eventRepository.update(event, data);
  },

  async deleteEvent(eventId, userId, userRole) {
    if (!mongoose.isValidObjectId(eventId)) {
      throw new Error("Invalid event ID");
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }
    if (!userRole) {
      throw new Error("Missing user role");
    }

    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    const isOwner = event.createdBy._id.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden");
    }

    return eventRepository.delete(event);
  },

  async getEvent(eventId) {
    if (!mongoose.isValidObjectId(eventId)) {
      throw new Error("Invalid event ID");
    }

    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    return event;
  },

  async getEventStats() {
    return eventRepository.aggregateStats();
  },
};
