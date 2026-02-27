import express from "express";
import { getAllEvents, createEvent, updateEvent, deleteEvent, getEvent} from "../controllers/eventsController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

//events routes
router.get("/", getAllEvents);
router.get("/:id", getEvent)
// router.use(requireAuth)
router.post("/", createEvent);
router.put("/:id", updateEvent)
router.delete("/:id", deleteEvent)


export default router;