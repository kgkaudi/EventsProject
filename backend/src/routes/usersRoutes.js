import express from "express";
import {
  signupUser,
  deleteUser,
  loginUser,
  getUser,
  updateUser,
  getUsers,
  updateUserPassword,
  updateUserRole,
} from "../controllers/usersController.js";

import requireAuth from "../middleware/requireAuth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/signup", signupUser);

// Admin / protected routes
router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.put("/change-password/:id", updateUserPassword);
router.delete("/:id", requireAuth, deleteUser);
router.put("/:id/role", requireAuth, adminOnly, updateUserRole);

export default router;