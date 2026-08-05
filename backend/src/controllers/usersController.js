import { userService } from "../services/userService.js";

//
// ─────────────────────────────────────────────
//   LOGIN (identifier = name OR email)
// ─────────────────────────────────────────────
//
export async function loginUser(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Validation faileds",
        errors: ["Name or email required", "Password required"],
      });
    }

    // User.login (via the service/repository) already handles
    // determining whether the identifier is an email or a name,
    // so we just forward the raw string.
    const result = await userService.login(identifier, password);
    res.status(200).json(result);
  } catch (error) {
    const status =
      error.message === "User not found"
        ? 404
        : error.message === "Invalid credentials"
          ? 401
          : 500;

    res.status(status).json({ error: error.message });
  }
}

//
// ─────────────────────────────────────────────
//   SIGNUP
// ─────────────────────────────────────────────
//
export async function signupUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const result = await userService.signup(name, email, password, role);
    res.status(201).json(result);
  } catch (error) {
    const status =
      error.message === "Email already in use" ||
      error.message === "Name already in use"
        ? 409
        : error.message === "You must fill all the fields" ||
            error.message === "Email is not valid" ||
            error.message === "Password is not strong enough"
          ? 400
          : 500;

    res.status(status).json({ error: error.message });
  }
}

//
// ─────────────────────────────────────────────
//   GET ALL USERS
// ─────────────────────────────────────────────
//
export async function getUsers(req, res) {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//
// ─────────────────────────────────────────────
//   GET USER BY ID
// ─────────────────────────────────────────────
//
export async function getUser(req, res) {
  try {
    const user = await userService.getUser(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({ message: error.message });
    }
    const status = error.message === "User not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}

//
// ─────────────────────────────────────────────
//   UPDATE USER
// ─────────────────────────────────────────────
//
export async function updateUser(req, res) {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).json({ message: error.message });
    }
    const status = error.message === "User not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}

//
// ─────────────────────────────────────────────
//   UPDATE PASSWORD
// ─────────────────────────────────────────────
//
export async function updateUserPassword(req, res) {
  try {
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both password fields are required" });
    }

    const result = await userService.updatePassword(
      req.params.id,
      password,
      newPassword
    );

    res.status(200).json(result);
  } catch (error) {
    const status = error.message.includes("required")
      ? 400
      : error.message.includes("strong")
        ? 400
        : error.message.includes("Incorrect")
          ? 401
          : error.message === "User not found"
            ? 404
            : 500;

    res.status(status).json({ message: error.message });
  }
}

//
// ─────────────────────────────────────────────
//   DELETE USER
// ─────────────────────────────────────────────
//
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
      error.message === "Unauthorized"
        ? 401
        : error.message === "Incorrect password"
          ? 400
          : error.message === "User not found"
            ? 404
            : 500;

    res.status(status).json({ message: error.message });
  }
}

//
// ─────────────────────────────────────────────
//   UPDATE ROLE
// ─────────────────────────────────────────────
//
export async function updateUserRole(req, res) {
  try {
    const updated = await userService.updateRole(req.params.id, req.body.role);
    res.status(200).json(updated);
  } catch (error) {
    const status =
      error.message === "Invalid role"
        ? 400
        : error.message === "User not found"
          ? 404
          : 500;

    res.status(status).json({ message: error.message });
  }
}