import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
