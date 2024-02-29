import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

import { Otp } from "../../models/otp.server.model.js";
import { generateDatabaseToken } from "./auth.server.controller.js";
import { User } from "../../models/user.server.model.js";
import { logger } from "../../utils/logger.util.js";

dotenv.config();

// nodemailer transport
let transport = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const generateOtp = async (email, userId) => {
  const currentOtp = await Otp.findOne({ userId: userId });
  if (currentOtp) {
    await Otp.deleteMany({ userId: userId });
    logger.info("Previous Otp deleted", { meta: { method: "generateOtp" } });
  }

  try {
    const newOTP = `${Math.floor(100000 + Math.random() * 900000)}`;

    const hashedOtp = await bcrypt.hash(newOTP, 10);
    const newOtp = new Otp({
      userId: userId,
      otp: hashedOtp,
      createdAt: Date.now(),
      expireAt: Date.now() + 120000,
    });

    await newOtp.save();

    await transport
      .sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Confirmation email from Orage Technologies",
        html: `Enter this otp for verifying your account: <b>${newOTP}</b>
              Your otp will expire in 2 minutes`,
      })
      .then(() => {
        logger.info("Email sent", { meta: { method: "generateOtp" } });
      });
  } catch (err) {
    logger.error(`${err}`, { meta: { method: "generateOtp" } });
  }
};

export const verifyOtp = async (req, res) => {
  const userOtp = await Otp.findOne({ userId: req.body.userId });

  if (userOtp === null) {
    logger.error("Otp not generated", { meta: { method: "verifyOtp" } });
    return res.status(401).json({
      otpExpired: false,
      otpValid: false,
    });
  }

  let { expireAt } = userOtp;

  if (expireAt < Date.now()) {
    await Otp.deleteMany({ userId: req.body.userId });
    logger.warn("Otp expired", { meta: { method: "verifyOtp" } });
    return res.status(200).json({
      otpExpired: true,
      otpValid: false,
    });
  }
  try {
    if (!(await bcrypt.compare(req.body.otp, userOtp.otp))) {
      logger.warn("Wrong otp", { meta: { method: "verifyOtp" } });
      res.status(200).json({
        otpValid: false,
        otpExpired: false,
      });
    } else {
      await User.updateOne({ _id: req.body.userId }, { confirmed: true });
      await Otp.deleteOne({ userId: req.body.userId });

      const params = {
        uid: req.body.userId,
      };

      const newAccessToken = jwt.sign(params, process.env.SECRET, {
        expiresIn: "15m",
      });

      const newRefreshToken = jwt.sign(params, process.env.REFRESH_SECRET, {
        expiresIn: "30d",
      });

      generateDatabaseToken(req.body.userId, newRefreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // corresponds to 7 day
      });

      res.status(201).json({
        otpValid: true,
        otpExpired: false,
        userVerified: true,
        accessToken: newAccessToken,
      });
    }
  } catch (err) {
    logger.error(`${err}`, { meta: { method: "verifyOtp" } });
    res.status(500).json({
      otpValid: false,
      otpExpired: false,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    let { userId } = req.body;
    const userOtp = await User.findOne({ _id: userId });

    if (userId === null) {
      logger.error("No userId found", { meta: { method: "resendOtp" } });
      return res.status(401).json({
        otpResent: false
      });
    } else {
      await Otp.deleteOne({ userId });
      generateOtp(userOtp.email, userId);
      logger.info("Otp resent", { meta: { method: "resendOtp" } });
      res.status(200).json({
        otpResent: true
      });
    }
  } catch (err) {
    logger.error(`${err}`, { meta: { method: "resendOtp" } });
    res.status(500).json({
      otpResent: false
    });
  }
};
