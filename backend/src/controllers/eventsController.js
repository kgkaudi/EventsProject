import Event from "../models/Event.js";
import User from "../models/User.js";

export async function getAllEvents(req, res) {
  //send events
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error in getAllEvents", error);
    res.status(500).json({ meassage: "Internal server error" });
  }
}

export async function getMyEvents(req, res) {
  try {
    const userId = req.user._id;

    const events = await Event.find({ createdBy: userId }).sort({
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
    // Support both authenticated user and explicit createdBy
    const userId = req.user?._id || req.body.createdBy;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing createdBy or user context" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const createdBy = user._id;

    const { title, content, location, maxcapacity, date } = req.body;

    const newEvent = new Event({
      title,
      content,
      location,
      maxcapacity,
      date,
      createdBy,
    });

    await newEvent.save();

    res.status(201).json({ message: "Your event was created successfully" });
  } catch (error) {
    console.error("Error in createEvent controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateEvent(req, res) {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Your event was not found" });
    }

    // Check ownership
    if (event.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this event" });
    }

    // Apply updates
    const { title, content, location, maxcapacity, date } = req.body;

    event.title = title ?? event.title;
    event.content = content ?? event.content;
    event.location = location ?? event.location;
    event.maxcapacity = maxcapacity ?? event.maxcapacity;
    event.date = date ?? event.date;

    const updated = await event.save();

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateEvent controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteEvent(req, res) {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Your event was not found" });
    }

    // Check ownership
    if (event.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this event" });
    }

    await event.deleteOne();

    res.status(200).json({ message: "Your event was deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEvent controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getEvent(req, res) {
  //send events
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!event)
      return res.status(404).json({ meassage: "Your event was not found" });
    res.status(200).json(event);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Your event was not found" });
    }
    console.error("Error in getAllEvents", error);
    res.status(500).json({ meassage: "Internal server error" });
  }
}