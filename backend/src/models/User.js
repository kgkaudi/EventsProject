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
  if (!name || !email || !password || !role) {
    throw Error("You must fill all the fields");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    name,
    email,
    password: hash,
    role: "user",
  });

  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("You must fill all the fields");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
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