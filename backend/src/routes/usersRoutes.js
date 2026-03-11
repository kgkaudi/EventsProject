import express from "express";
import { signupUser, deleteUser, loginUser, getUser, updateUser, getUsers, updateUserPassword } from "../controllers/usersController.js";

const router = express.Router();

//events routes
router.post("/login", loginUser);
router.post("/signup", signupUser);

//user admin routes
router.get("/", getUsers)
router.get("/:id", getUser)
router.put("/:id", updateUser)
router.put("/change-password/:id", updateUserPassword)
router.delete("/:id", deleteUser)


export default router;