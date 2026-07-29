// DTO for signup and update
export const validateUserDTO = (data) => {
  const errors = [];

  if (!data.email || !data.email.includes("@")) {
    errors.push("Invalid email");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password too short");
  }

  // Optional fields
  if (data.name && typeof data.name !== "string") {
    errors.push("Invalid name");
  }

  if (data.role && !["user", "admin"].includes(data.role)) {
    errors.push("Invalid role");
  }

  return errors;
};

// DTO for login
export const validateLoginDTO = (data) => {
  const errors = [];

  if (!data.email || !data.email.includes("@")) {
    errors.push("Invalid email");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password too short");
  }

  return errors;
};

export const validatePasswordChangeDTO = (data) => {
  const errors = [];
  if (!data.password) errors.push("Old password required");
  if (!data.newPassword) errors.push("New password required");
  return errors;
};
