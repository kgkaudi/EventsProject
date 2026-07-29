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
import { validateDTO } from "../middleware/validateDTO.js";
import { validateUserDTO, validateLoginDTO, validatePasswordChangeDTO } from "../dto/UserDTO.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/login", validateDTO(validateLoginDTO), loginUser);
router.post("/signup", validateDTO(validateUserDTO), signupUser);
router.get("/", getUsers);
router.get("/:id", getUser);

// PROTECTED
router.put("/:id", requireAuth, validateDTO(validateUserDTO), updateUser);
router.put("/change-password/:id",validateDTO(validatePasswordChangeDTO),updateUserPassword);
router.delete("/:id", requireAuth, deleteUser);
router.put("/:id/role", requireAuth, adminOnly, updateUserRole);

export default router;