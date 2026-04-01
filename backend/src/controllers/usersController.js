import User from "../models/User.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import Event from "../models/Event.js";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function signupUser(req, res) {
  const { name, email, password, role } = req.body;

  try {
    const user = await User.signup(name, email, password, role);
    const token = createToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Your user was not found" });

    res.status(200).json(user);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Your user was not found" });
    }
    console.error("Error in getUser", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUser(req, res) {
  try {
    const updates = { ...req.body };
    delete updates.password;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error("Error in updateUser", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserPassword(req, res) {
  try {
    const userId = req.params.id;
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw Error("New Password is not strong enough");
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updateUserPassword", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const { password } = req.body;

    if (!password)
      return res
        .status(400)
        .json({ message: "Password is required to delete a user" });

    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "Your user was not found" });

    await Event.deleteMany({ createdBy: userId });

    res.status(200).json({
      message: "User and all associated events were deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUser", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (error) {
    console.error("Error updating role", error);
    res.status(500).json({ message: "Internal server error" });
  }
}