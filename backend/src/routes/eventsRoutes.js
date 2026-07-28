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

// PUBLIC ROUTES
router.get("/", getAllEvents);

// STATS (protected)
router.get("/stats", requireAuth, adminOnly, getEventStats);

// AUTHENTICATED ROUTES
router.use(requireAuth);

router.get("/mine", getMyEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

// MUST BE LAST AND OUTSIDE AUTH BLOCK
router.get("/:id", getEvent);

export default router;