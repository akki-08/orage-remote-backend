import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expireAt: {
    type: Date,
    required: true,
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
