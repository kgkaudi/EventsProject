import Event from "../models/Event.js";

export const eventRepository = {
  async findAll(query, { skip, limit }) {
    return Event.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);
  },

  async count(query) {
    return Event.countDocuments(query);
  },

  async findById(id) {
    return Event.findById(id).populate("createdBy", "name email");
  },

  async findByUser(userId) {
    return Event.find({ createdBy: userId }).sort({ createdAt: -1 });
  },

  async create(data) {
    const event = new Event(data);
    return event.save();
  },

  async update(event, data) {
    Object.assign(event, data);
    return event.save();
  },

  async delete(event) {
    return event.deleteOne();
  },

  async aggregateStats() {
    const totalEvents = await Event.countDocuments();
    const eventsPerUser = await Event.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
    ]);
    return { totalEvents, eventsPerUser };
  },
};
