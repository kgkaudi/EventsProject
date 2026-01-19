import express from "express";
import { getAllEvents, createEvent, updateEvent, deleteEvent, getEvent} from "../controllers/eventsController.js";

const router = express.Router();

//events routes
router.get("/", getAllEvents);
router.get("/:id", getEvent)
router.post("/", createEvent);
router.put("/:id", updateEvent)
router.delete("/:id", deleteEvent)


export default router;







