import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../src/models/User.js";
import Event from "../src/models/Event.js";

dotenv.config();

async function runSeed() {
  try {
    console.log("Starting seed...");

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "KostasEvents",
    });

    console.log("📡 Connected to MongoDB");

    // ---------------------------------------------------
    // 1. Create Admin User
    // ---------------------------------------------------
    const adminEmail = "admin@test.com";

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const hashed = await bcrypt.hash("Admin123!", 10);

      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashed,
        role: "admin",
      });

      console.log("Admin user created:", admin.email);
    } else {
      console.log("Admin user already exists:", admin.email);
    }

    // ---------------------------------------------------
    // 2. Create Test Event
    // ---------------------------------------------------
    const existingEvent = await Event.findOne({ title: "Test Event" });

    if (!existingEvent) {
      await Event.create({
        title: "Test Event",
        content: "This is a seeded test event.",
        location: "Gothenburg",
        maxcapacity: 100,
        date: "2026-01-01",
        categories: ["tech"],
        tags: ["seed", "test"],
        createdBy: admin._id,
      });

      console.log("Test event created");
    } else {
      console.log("Test event already exists");
    }

    console.log("Seed completed successfully");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  }
}

runSeed();
