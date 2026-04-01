import express from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  getMyEvents,
  getEventStats
} from "../controllers/eventsController.js";
import requireAuth from "../middleware/requireAuth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/stats", requireAuth, adminOnly, getEventStats);
router.get("/:id", getEvent);

// Protected routes
router.use(requireAuth);
router.get("/mine", getMyEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;