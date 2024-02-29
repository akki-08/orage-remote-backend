import dotenv from "dotenv";
import { Session } from "../../models/session.server.model.js";
import { logger } from "../../utils/logger.util.js";
import os from "os";
import express from "express";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const content = new mongoose.Schema({
  code:Number,
  sessionName: String,
  ipAddress: String
});

const session_content = mongoose.model('session_content', content);

dotenv.config();

// export const createSession = async (req, res) => {
//   try {
//     const { code, sessionName } = req.body;
//     console.log(`some body ${code}, ${sessionName}`);
//     const currentSess = await Session.findOne({ sessCode: code });

//     if (currentSess) {
//       return res.status(201).json({
//         sessCodeCreated: true,
//         sessionExists: true,
//       });
//     }

//     const newSession = new Session({
//       sessCode: code,
//       hostname: os.hostname(),
//       sessionName: sessionName
//     });

//     newSession.save();

//     return res.status(201).json({
//       sessCodeCreated: true,
//       sessionExists: false,
//     });
//   } catch (err) {
//     logger.error(`${err}`, { meta: { method: "setSessCode" } });
//     return res.status(500).json({
//       sessCodeCreated: false,
//     });
//   }
// };
export const createSession = async (req, res) => {
  const {code , sessionName } = req.body;

  const systemIP = getSystemIP();
  
  // Create a new session document
  const session = new session_content({
    code: code,
    sessionName: sessionName,
    ipAddress: systemIP
  });

  // Save the session document to MongoDB
  session.save()
    .then(() => {
      res.status(200).send('Session data stored successfully');
    })
    .catch(err => {
      console.error('Error storing session data:', err);
      res.status(500).send('Internal Server Error');
    });
};

function getSystemIP() {
  const interfaces = os.networkInterfaces();
  let systemIP = '';

  for (const key in interfaces) {
    for (const iface of interfaces[key]) {
      if (!iface.internal && iface.family === 'IPv4') {
        systemIP = iface.address;
        break;
      }
    }
    if (systemIP) break;
  }

  return systemIP;
}
export const getSession = async (req, res) => {
  try {
    // Query MongoDB to find all session content
    const sessions = await session_content.find();

    // Return the sessions as the response
    res.status(200).json({ sessions: sessions });
  } catch (error) {
    console.error('Error fetching session content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
  export const getAllSession = async (req, res) => {
    try {
      // Query MongoDB to find all session content
      const sessions = await session_content.find();
  
      // Return the sessions as the response
      res.status(200).json({ sessions: sessions });
    } catch (error) {
      console.error('Error fetching session content:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteSession = async (req, res) => {
  try {
    // Extract session name and IP address from the request body
    const { sessionName, ipAddress } = req.body;

    // Query MongoDB to find and delete the session based on session name and IP address
    const deletedSession = await session_content.findOneAndDelete({ sessionName, ipAddress });

    // Check if session was found and deleted
    if (!deletedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Return success message
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteSessionsByIPAddress = async (req, res) => {
  try {
    // Extract the IP address from the request body
    const { ipAddress } = req.body;

    // Query MongoDB to find and delete all sessions based on the IP address
    const deletedSessions = await session_content.deleteMany({ ipAddress });

    // Check if any sessions were deleted
    if (deletedSessions.deletedCount === 0) {
      return res.status(404).json({ message: 'No sessions found for the provided IP address' });
    }

    // Return success message
    res.status(200).json({ message: 'All sessions for the provided IP address deleted successfully' });
  } catch (error) {
    console.error('Error deleting sessions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getSessionIdBySessionName = async (req, res) => {
  try {
    const { sessionName } = req.body;

    // Query MongoDB to find the session by sessionName
    const session = await session_content.findOne({ sessionName });

    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Extract the ObjectId from the session
    const sessionId = session._id;

    // Return the session's ObjectId
    res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Error fetching session ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};