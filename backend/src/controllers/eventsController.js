import { eventService } from "../services/eventService.js";

export async function getAllEvents(req, res) {
  try {
    const result = await eventService.getAllEvents(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllEvents", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getMyEvents(req, res) {
  try {
    const userId = req.user._id.toString();
    const events = await eventService.getMyEvents(userId);
    res.status(200).json(events);
  } catch (error) {
    console.error("Error in getMyEvents", error);
    res.status(500).json({ message: error.message });
  }
}

export async function createEvent(req, res) {
  try {
    const userId = req.user?._id?.toString();
    const result = await eventService.createEvent(req.body, { _id: userId });
    res.status(201).json({ message: "Your event was created successfully", result });
  } catch (error) {
    console.error("Error in createEvent", error);
    const status = error.message.includes("Missing")
      ? 400
      : error.message.includes("not found")
      ? 404
      : 500;
    res.status(status).json({ message: error.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const userId = req.user._id.toString();
    const updated = await eventService.updateEvent(
      req.params.id,
      req.user._id.toString(),
      req.body,
      req.user.role
    );
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateEvent", error);

    if (error.name === "CastError") {
      return res.status(404).json({ message: "Event not found" });
    }

    const status =
      error.message === "Forbidden"
        ? 403
        : error.message === "Event not found"
        ? 404
        : 500;

    res.status(status).json({ message: error.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const userId = req.user._id.toString();   // ← FIX
    await eventService.deleteEvent(req.params.id, userId, req.user.role);
    res.status(200).json({ message: "Your event was deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEvent", error);

    if (error.name === "CastError") {
      return res.status(404).json({ message: "Event not found" });
    }

    const status =
      error.message === "Forbidden"
        ? 403
        : error.message === "Event not found"
        ? 404
        : 500;

    res.status(status).json({ message: error.message });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await eventService.getEvent(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    console.error("Error in getEvent", error);

    if (error.name === "CastError") {
      return res.status(404).json({ message: "Event not found" });
    }

    const status = error.message === "Event not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}

export async function getEventStats(req, res) {
  try {
    const stats = await eventService.getEventStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getEventStats", error);
    res.status(500).json({ message: error.message });
  }
}
