import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import Event from "./Event.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.statics.signup = async function (name, email, password, role) {
  if (!name || !email || !password) {
    throw Error("You must fill all the fields");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  const normalizedEmail = email.toLowerCase();

  const emailExists = await this.findOne({ email: normalizedEmail });
  if (emailExists) {
    throw Error("Email already in use");
  }

  const nameExists = await this.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  });
  if (nameExists) {
    throw Error("Name already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    name,
    email: normalizedEmail,
    password: hash,
    role: role || "user",
  });

  return user;
};

// Escapes regex special characters so user input can't alter the pattern's
// meaning (e.g. avoids ReDoS or unintended matches from "." or "*").
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

userSchema.statics.login = async function (identifier, password) {
  if (!identifier || !password) {
    throw Error("You must fill all the fields");
  }

  // If identifier contains "@", treat it as email
  const isEmail = identifier.includes("@");

  const user = isEmail
    ? await this.findOne({ email: identifier.toLowerCase() })
    : await this.findOne({
        name: { $regex: `^${escapeRegex(identifier)}$`, $options: "i" },
      });

  if (!user) {
    throw Error("Incorrect name or email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

userSchema.pre("findOneAndDelete", async function () {
  const userId = this.getQuery()["_id"];
  await Event.deleteMany({ createdBy: userId });
});

const User = mongoose.model("User", userSchema);
export default User;