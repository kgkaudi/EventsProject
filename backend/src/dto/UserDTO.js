// DTO for signup and update
export const validateUserDTO = (data) => {
  const errors = [];

  // Name required for signup, optional for update
  if (!data.name || typeof data.name !== "string") {
    errors.push("Invalid name");
  }

  // Email required for signup/update
  if (!data.email || !data.email.includes("@")) {
    errors.push("Invalid email");
  }

  // Password optional for update, but if provided must be valid
  if (data.password && data.password.length < 6) {
    errors.push("Password too short");
  }

  // Optional role
  if (data.role && !["user", "admin"].includes(data.role)) {
    errors.push("Invalid role");
  }

  return errors;
};

// DTO for login (identifier = name OR email)
export const validateLoginDTO = (data) => {
  const errors = [];

  // Must provide an identifier (name or email)
  if (!data.identifier || typeof data.identifier !== "string") {
    errors.push("Name or email required");
  }

  // If the identifier looks like an email, validate its shape
  if (
    data.identifier &&
    data.identifier.includes("@") &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier)
  ) {
    errors.push("Invalid email");
  }

  // Password required
  if (!data.password || data.password.length < 6) {
    errors.push("Password too short");
  }

  return errors;
};

// DTO for password change
export const validatePasswordChangeDTO = (data) => {
  const errors = [];

  if (!data.password) errors.push("Old password required");
  if (!data.newPassword) errors.push("New password required");

  return errors;
};
