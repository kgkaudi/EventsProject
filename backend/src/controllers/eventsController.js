import { eventService } from "../services/eventService.js";

function mapErrorToStatus(message) {
  if (message === "Invalid pagination values") return 400;
  if (message === "Search query must be a string") return 400;
  if (message === "Missing createdBy or user context") return 400;
  if (message === "Invalid user ID") return 400;
  if (message === "User not found") return 404;
  if (message === "Invalid event ID") return 404;
  if (message === "Missing user role") return 400;
  if (message === "Forbidden") return 403;
  if (message === "Event not found") return 404;
  return 500;
}

export async function getAllEvents(req, res) {
  try {
    const result = await eventService.getAllEvents(req.query);
    res.status(200).json(result);
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}

export async function getMyEvents(req, res) {
  try {
    const userId = req.user._id.toString();
    const events = await eventService.getMyEvents(userId);
    res.status(200).json(events);
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}

export async function createEvent(req, res) {
  try {
    const userId = req.user?._id?.toString();
    const result = await eventService.createEvent(req.body, { _id: userId });
    res.status(201).json({
      message: "Your event was created successfully",
      result,
    });
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const updated = await eventService.updateEvent(
      req.params.id,
      req.user._id.toString(),
      req.body,
      req.user.role,
    );
    res.status(200).json(updated);
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    await eventService.deleteEvent(
      req.params.id,
      req.user._id.toString(),
      req.user.role,
    );
    res.status(200).json({ message: "Your event was deleted successfully" });
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await eventService.getEvent(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}

export async function getEventStats(req, res) {
  try {
    const stats = await eventService.getEventStats();
    res.status(200).json(stats);
  } catch (error) {
    const status = mapErrorToStatus(error.message);
    res.status(status).json({ message: error.message });
  }
}
