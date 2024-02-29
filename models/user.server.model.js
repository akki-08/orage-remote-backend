import mongoose from "mongoose";

const user = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    confirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", user);
