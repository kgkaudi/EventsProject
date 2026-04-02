import Event from "../models/Event.js";
import User from "../models/User.js";

export async function getAllEvents(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const { q } = req.query;
    const query = {};

    if (q) {
      const words = q.trim().split(/\s+/);

      // 1. Detect date
      const dateWord = words.find((w) => !isNaN(Date.parse(w)));
      if (dateWord) {
        const date = new Date(dateWord);
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        query.date = { $gte: start, $lte: end };
      }

      // 2. Detect location (simple heuristic)
      const locationCandidates = [
        "gothenburg",
        "stockholm",
        "berlin",
        "athens",
      ];
      const locationWord = words.find((w) =>
        locationCandidates.includes(w.toLowerCase()),
      );

      if (locationWord) {
        query.location = { $regex: locationWord, $options: "i" };
      }

      // 3. Remaining words → keyword search
      const keywordWords = words.filter(
        (w) => w !== dateWord && w !== locationWord,
      );
      if (keywordWords.length > 0) {
        const keyword = keywordWords.join(" ");

        query.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { content: { $regex: keyword, $options: "i" } },
          { categories: { $regex: keyword, $options: "i" } },
          { tags: { $regex: keyword, $options: "i" } },
        ];
      }
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      events,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error in getAllEvents", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyEvents(req, res) {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error in getMyEvents", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createEvent(req, res) {
  try {
    const userId = req.user?._id || req.body.createdBy;

    if (!userId)
      return res
        .status(400)
        .json({ message: "Missing createdBy or user context" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newEvent = new Event({
      ...req.body,
      createdBy: user._id,
    });

    await newEvent.save();

    res.status(201).json({ message: "Your event was created successfully" });
  } catch (error) {
    console.error("Error in createEvent", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Your event was not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this event" });
    }

    Object.assign(event, req.body);
    const updated = await event.save();

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateEvent", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Your event was not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this event" });
    }

    await event.deleteOne();

    res.status(200).json({ message: "Your event was deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEvent", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!event)
      return res.status(404).json({ message: "Your event was not found" });

    res.status(200).json(event);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Your event was not found" });
    }
    console.error("Error in getEvent", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getEventStats(req, res) {
  try {
    const totalEvents = await Event.countDocuments();

    const eventsPerUser = await Event.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
    ]);

    res.json({ totalEvents, eventsPerUser });
  } catch (error) {
    console.error("Error in getEventStats", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
