import express from "express";
import { signupUser, deleteUser, loginUser, getUser, updateUser, getUsers } from "../controllers/usersController.js";

const router = express.Router();

//events routes
router.post("/login", loginUser);
router.post("/signup", signupUser);

//user admin routes
router.get("/", getUsers)
router.get("/:id", getUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)


export default router;