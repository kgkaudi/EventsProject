import express from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  getMyEvents,
  getEventStats,
} from "../controllers/eventsController.js";
import requireAuth from "../middleware/requireAuth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllEvents);

// STATS (protected)
router.get("/stats", requireAuth, adminOnly, getEventStats);

// GET MY EVENTS
router.get("/mine", requireAuth, getMyEvents);
// PUBLIC EVENT BY ID
router.get("/:id", getEvent);

// AUTHENTICATED ROUTES
router.use(requireAuth);

router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;