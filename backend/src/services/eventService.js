import { eventRepository } from "../repositories/eventRepository.js";
import { userRepository } from "../repositories/userRepository.js";

export const eventService = {
  async getAllEvents(queryParams) {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 9;
    const skip = (page - 1) * limit;

    const { q } = queryParams;
    const query = {};

    if (q) {
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
    return eventRepository.findByUser(userId);
  },

  async createEvent(data, userContext) {
    const userId = userContext?._id || data.createdBy;
    if (!userId) throw new Error("Missing createdBy or user context");

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    return eventRepository.create({ ...data, createdBy: user._id });
  },

  async updateEvent(eventId, userId, data, userRole) {
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
    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");
    return event;
  },

  async getEventStats() {
    return eventRepository.aggregateStats();
  },
};
