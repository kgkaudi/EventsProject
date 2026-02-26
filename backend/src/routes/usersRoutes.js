import express from "express";
import { signupUser, deleteUser, loginUser, getUser, updateUser } from "../controllers/usersController.js";

const router = express.Router();

//events routes
router.get("/login", loginUser);
router.get("/login/:id", getUser)
router.post("/signup", signupUser);
router.put("/signup/:id", updateUser)
router.delete("/signup/:id", deleteUser)


export default router;