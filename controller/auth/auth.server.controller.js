import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { logger } from "../../utils/logger.util.js";
import { User } from "../../models/user.server.model.js";
import { RefreshToken } from "../../models/refreshToken.server.model.js";
import { generateOtp } from "./otp.server.controller.js";

dotenv.config();

export const register = async (req, res) => {
  const currentUser = await User.findOne({ email: req.body.email });
  if (currentUser && currentUser.confirmed)
    return res.status(201).json({
      userVerified: true,
    });

  if (currentUser && !currentUser.confirmed) {
    generateOtp(currentUser.email, currentUser._id.toString());
    return res.status(200).json({
      userVerified: false,
      uid: currentUser._id.toString(),
    });
  }

  try {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const email = req.body.email;
    const newUser = new User({
      email: email,
      password: hashedpassword,
    });

    newUser.save();
    generateOtp(email, newUser._id.toString());

    res.status(200).json({
      userVerified: false,
      uid: newUser._id.toString(),
    });

    logger.info(`User created: ${email}`, { meta: { method: "register" } });
  } catch (err) {
    res.status(500).json({
      userVerified: false,
    });
    logger.error(`${err}`, { meta: { method: "register" } });
  }
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user === null) {
    return res.status(400).json({
      userExists: false,
    });
  }

  if (!user.confirmed) {
    return res.status(401).json({
      userExists: true,
      userVerified: false,
    });
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const params = {
        uid: user._id.toString(),
      };

      let newAccessToken = '';
      let newRefreshToken = '';
      if (!req.body.remember) {
	newAccessToken = jwt.sign(params, process.env.SECRET);
      } else {
        newAccessToken = jwt.sign(params, process.env.SECRET, {
          expiresIn: "15m",
	});
	newRefreshToken = jwt.sign(params, process.env.REFRESH_SECRET, {
	  expiresIn: "30d",
	});
        generateDatabaseToken(user._id.toString(), newRefreshToken);

        res.cookie("refreshToken", newRefreshToken, {
	  sameSite: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie("accessToken", newAccessToken, {
	  sameSite: true,
          maxAge: 15 * 60 * 1000, // 15 mins
        });
      }

      res.status(200).json({
        userExists: true,
        userVerified: true,
        isPasswordTrue: true,
        accessToken: newAccessToken,
      });
    } else {
      logger.warn("User creds wrong", { meta: { method: "login" } });
      res.status(200).json({
        userExists: true,
        userVerified: true,
        isPasswordTrue: false,
      });
    }
  } catch (err) {
    logger.error(err, { meta: { method: "login" } });
    res.status(500).json({
      userExists: false,
      userVerified: false,
    });
  }
};

export const dashboard = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const clientAccessToken = authHeaders && authHeaders.split(" ")[1];
    // const clientAccessToken = req.cookies['accessToken']
    // logger.info(clientAccessToken, { method: 'dashboard' })
    if (!clientAccessToken) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const payload = jwt.verify(clientAccessToken, process.env.SECRET);

    if (!payload) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const user = User.findOne({ _id: payload.uid });

    if (!user) {
      return res.status(401).json({
        authenticated: false,
        userExists: false,
      });
    }

    res.status(200).json({
      authenticated: true,
    });
  } catch (err) {
    logger.error(`${err}`, { meta: { method: "dashboard" } });
    res.status(500).json({
      authenticated: false,
      userExists: false,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      logger.warn("RefreshToken deleted", { meta: { method: "refresh" } });
      return res.status(400).json({
        authenticated: false,
        tokenExists: false,
      });
    }

    if (!verifyRefreshToken(refreshToken)) {
      logger.warn("Refresh tokens does not match", {
        meta: { method: "refresh" },
      });
      return res.status(401).json({
        authenticated: false,
      });
    }

    const refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    if (!refreshPayload) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const params = {
      uid: refreshPayload.uid,
    };
    const newAccessToken = jwt.sign(params, process.env.SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign(params, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });

    generateDatabaseToken(refreshPayload.uid, newRefreshToken);

    // res.cookie("refreshToken", newRefreshToken, {
    //   httpOnly: true,
    //   sameSite: "none",
    //   secure: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.status(200).json({
      authenticated: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    logger.error(err, { meta: { method: "refresh" } });
    return res.status(401).json({
      authenticated: false,
    });
  }
};

// verifies the client's refresh token with database's refresh token
const verifyRefreshToken = async (clientRefreshToken) => {
  try {
    const refreshPayload = jwt.verify(
      clientRefreshToken,
      process.env.REFRESH_SECRET,
    );
    if (!refreshPayload) {
      return false;
    }
    const databaseToken = await RefreshToken.findOne({
      userId: refreshPayload.uid,
    });
    if (!databaseToken) {
      return false;
    } else if (databaseToken.refreshToken === clientRefreshToken) {
      return true;
    }
  } catch (err) {
    logger.error(err, { meta: { method: "verifyRefreshToken" } });
  }
};

// creates new refresh token or updates the current refresh token into the database
export const generateDatabaseToken = async (userId, refreshToken) => {
  try {
    const currentRefreshToken = await RefreshToken.findOne({ userId: userId });

    if (currentRefreshToken === null) {
      const newDatabaseToken = new RefreshToken({
        refreshToken: refreshToken,
        userId: userId,
      });

      newDatabaseToken.save();
    } else {
      await RefreshToken.updateOne(
        { userId: userId },
        { refreshToken: refreshToken },
      );
    }
  } catch (err) {
    logger.error(err, { meta: { meta: { method: "generateDatabaseToken" } } });
  }
};

export const logout = async (req, res) => {
  res.cookie("refreshToken", "", {
    maxAge: 0,
  });
  res.cookie("accessToken", "", {
    maxAge: 0,
  });
  res.status(200).json({
    authenticated: false,
    accessToken: "",
  });
};
