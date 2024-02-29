import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessCode: {
    type: String,
    trim: true,
    required: true,
  },
  hostname: {
    type: String,
    trim: true,
    required: true,
  },
  sessionName: {
    type: String,
    trim: true,
    required: true
  }
});

export const Session = mongoose.model("Session", sessionSchema);
