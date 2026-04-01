import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    location: String,
    maxcapacity: Number,
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    date: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
