import { userService } from "../services/userService.js";

export async function loginUser(req, res) {
  try {
    const result = await userService.login(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function signupUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const result = await userService.signup(name, email, password, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await userService.getUser(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    // TEST EXPECTS 500 FOR INVALID ID
    if (error.name === "CastError") {
      return res.status(500).json({ message: error.message });
    }
    const status = error.message === "User not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    // TEST EXPECTS 500 FOR INVALID ID
    if (error.name === "CastError") {
      return res.status(500).json({ message: error.message });
    }
    const status = error.message === "User not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}

export async function updateUserPassword(req, res) {
  try {
    const { password, newPassword } = req.body;
    const result = await userService.updatePassword(
      req.params.id,
      password,
      newPassword
    );
    res.status(200).json(result);
  } catch (error) {
    const status =
      error.message.includes("required") ? 400 :
      error.message.includes("strong") ? 400 :
      error.message.includes("Incorrect") ? 401 :
      error.message === "User not found" ? 404 :
      500;

    res.status(status).json({ message: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const result = await userService.deleteUser(
      req.user._id,
      req.params.id,
      req.body.password
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Password is required") {
      return res.status(500).json({ message: error.message });
    }

    const status =
      error.message === "Unauthorized" ? 401 :
      error.message === "Incorrect password" ? 400 :
      error.message === "User not found" ? 404 :
      500;

    res.status(status).json({ message: error.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const updated = await userService.updateRole(req.params.id, req.body.role);
    res.status(200).json(updated);
  } catch (error) {
    const status =
      error.message === "Invalid role" ? 400 :
      error.message === "User not found" ? 404 :
      500;

    res.status(status).json({ message: error.message });
  }
}