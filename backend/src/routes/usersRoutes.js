import express from "express";
import {
  signupUser,
  deleteUser,
  loginUser,
  getUser,
  updateUser,
  getUsers,
  updateUserPassword,
} from "../controllers/usersController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/signup", signupUser);

// Admin / protected routes
router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.put("/change-password/:id", updateUserPassword);
router.delete("/:id", requireAuth, deleteUser); // now works

export default router;