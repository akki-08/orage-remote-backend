import os from "os";
import fs from "fs";
import open from "open";
import archiver from "archiver";
import path from "path";
import { exec } from "child_process";
import pkg from "pkg";
import express from "express";
import mongoose from "mongoose";
import chokidar from "chokidar";
import notifier from "node-notifier";
import ip from "ip";
import google from "googleapis";
import {
  register,
  login,
  logout,
  refresh,
  dashboard,
} from "../controller/auth/auth.server.controller.js";

import {
  resendOtp,
  verifyOtp,
} from "../controller/auth/otp.server.controller.js";

import {
  downloadClientConfig,
  downloadHostConfig,
  downloadHostExe,
  downloadHost,
  downloadClient,
  downloadSystemConfig,
} from "../controller/file/file.controller.js";

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const watcher = chokidar.watch("C:/Users/admin/Downloads/", {
  ignored: /^\./,
  persistent: true,
});

// const credentials = require('./credentials.json');
// import credentials from " ./package.json";
import GoogleAuth from "google-auth-library";
const auth = new google.Auth.GoogleAuth({
  // credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

// const drive = google.drive({ version: 'v3', auth });

const sessionSchema = new mongoose.Schema({
  sessionId: String,
  ipAddress: String,
});

const sessionInfo = new mongoose.Schema({
  code: Number,
  sessionName: String,
  ipAddress: String,
});

// const SessionInf = mongoose.model('SessionInf', sessionInfo);

// const Session = mongoose.model('Session', sessionSchema);

import {
  createSession,
  getSession,
  getAllSession,
  deleteSession,
  deleteSessionsByIPAddress,
  getSessionIdBySessionName
} from "../controller/session/session.server.controller.js";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const filePath = "C:/Users/admin/Desktop/csharp/";
// Define the routes function
export const routes = (app) => {
  app.post("/0auth/register", register);
  app.post("/0auth/login", login);
  app.post("/0auth/logout", logout);
  app.post("/0auth/refresh", refresh);
  app.post("/0auth/verifyOtp", verifyOtp);
  app.post("/0auth/resendOtp", resendOtp);
  app.post("/0auth/dashboard", dashboard);
  app.post("/0session/createSess", createSession);
  app.post("/0file/downloadHost", downloadHostConfig);
  //app.get("/0file/downloadHost", downloadHostExe);
  app.post("/0file/downloadClient", downloadClientConfig);
  app.get("/0file/downloadSystemConfig", downloadSystemConfig);
  app.get("/0file/host", downloadHost);
  app.get("/0file/client", downloadClient);
  app.get("/getAllSessions", getAllSession);
  app.delete("/deleteSession", deleteSession)
  app.delete("/deleteAllSessionByIP", deleteSessionsByIPAddress);
  app.get("/getSessionsObjectID", getSessionIdBySessionName);
  app.get("/generateSystemConfig", (req, res) => {
    const { customVariable } = req.query;

    const serverIP = getLocalIP();
    // const systemIP = getIPAddress();
    const systemIP = getLocalIP();

    const clientIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Retrieve system configuration information
    const systemConfig = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      userInfo: os.userInfo(),
      networkInterfaces: os.networkInterfaces(),
      customVariable: customVariable,
      serverIP: serverIP,
      clientIP: clientIP,
      systemIP: systemIP,
    };
    // Convert system configuration to text
    const systemConfigText = JSON.stringify(systemConfig, null, 2);
    const url = "http://localhost:4200"; // Change URL to your local server URL
    const openCommand = process.platform === "win32" ? "start" : "xdg-open";

    // Define the file name and path for the JavaScript file
    const fileName = "System-config.js";

    const csharpProjectPath = 'C:/ImageRelay/ImageRelay';
    const generatedExePath = `${csharpProjectPath}/bin/Release/net6.0-windows/ImageRelay.exe`;
    // const fileURL = 'https://drive.google.com/file/d/1gWMya5ocA9-YKzdz32tqCZ_6XEIlzbsE/view?usp=drive_link';
    const fileURL = 'C:/ImageRelay/ImageRelay/bin/Debug/net6.0-windows/ImageRelay.exe';
    // const path="C:/ImageRelay/ImageRelay/bin/Debug/net6.0-windows/ImageRelay.exe";
    const filePath = path.join("C:/Users/admin/Desktop/csharp/", fileName);
    const fileContent = `
    const os = require('os');
    const { exec } = require('child_process');
    const { networkInterfaces } = require('os');
    const interfaces = networkInterfaces();
    let systemIP = 'Unknown';

    Object.keys(interfaces).forEach((key) => {
      interfaces[key].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
              systemIP = iface.address;
          }
      });
    });
    console.log('Client IP:', systemIP);
    const hostIP = '${systemIP}'; 
    const localIP = hostIP;
    const localHostIP = getLocalIP();

    // Display system information
    console.log('Session ID:', '${customVariable}');
    console.log('Host IP:', '${systemIP}');
    console.log('Local Host IP:','${systemIP}' );
    console.log('Local Host IP using getLocalIP:',localHostIP );
    console.log('Platform:', os.platform());
    console.log('Architecture:', os.arch());
    console.log('CPUs:', JSON.stringify(os.cpus()));
    console.log('Total Memory:', os.totalmem(), 'bytes');
    console.log('Free Memory:', os.freemem(), 'bytes');
    console.log('User Info:', JSON.stringify(os.userInfo()));
    console.log('Network Interfaces:', JSON.stringify(os.networkInterfaces()));

    function getLocalIP() {
      const interfaces = os.networkInterfaces();
      for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (const alias of iface) {
          if (alias.family === "IPv4" && !alias.internal) {
            return alias.address;
          }
        }
      }
      return "0.0.0.0"; // Default IP address if not found
    }

    function displayPopupMessage(popupIP) {
      const popupCommand = 'msg * "User wants to join the session"';
      console.log('Local Host IP of the system is:', popupIP);
      exec(popupCommand, { host: popupIP }, (err, stdout, stderr) => {
        if (err) {
          console.error("Error sending popup message to host:", err);
        } else {
          console.log("Popup message sent to host");
        }
      });
    }
  
  // Open the URL on the user's system
  const url = '${url}'; // Replace with the desired URL
  require('child_process').exec('start ${url}', (err, stdout, stderr) => {
      if (err) {
          console.error("Error opening URL:", err);
      } else {
          console.log("URL opened successfully");
      }
  });
  
  // Handling exit
  displayPopupMessage('192.168.0.45');
  console.log('Press any key to exit...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
 `;

    // Write system configuration to the JavaScript file
    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error writing system configuration to file:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Use pkg to generate an executable for Windows 64-bit
      exec(
        `npx pkg ${filePath} --output C:/Users/admin/Desktop/csharp/System-config.exe --target node12-win-x64`,
        (err) => {
          if (err) {
            console.error("Error generating executable:", err);
            return res.status(500).send("Error generating executable");
          }

          // Send the executable file as a response
          res.download(
            "C:/Users/admin/Desktop/csharp/System-config.exe",
            "System-config.exe",
            (err) => {
              if (err) {
                console.error("Error sending file:", err);
                return res.status(500).send("Internal Server Error");
              }
              // console.log("Popup: User wants to join the session");
              // // For demonstration purposes, you can execute a command to display a message box
              // exec(
              //   `msg * "User wants to join the session"`,
              //   (err, stdout, stderr) => {
              //     if (err) {
              //       console.error("Error executing command:", err);
              //       return;
              //     }
              //     console.log("Message box displayed");
              //   }
              // );
            }
          );
        }
      );
    });
  });

  app.get('/generateSystemConfiguration', (req, res) => {
    const { customVariable } = req.query;
    const { IPAddress } = req.query;

    const serverIP = getLocalIP();
    // const systemIP = getIPAddress();
    const systemIP = getLocalIP();

    const clientIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Retrieve system configuration information
    const systemConfig = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      userInfo: os.userInfo(),
      networkInterfaces: os.networkInterfaces(),
      customVariable: customVariable,
      serverIP: serverIP,
      clientIP: clientIP,
      systemIP: systemIP,
    };
    // Convert system configuration to text
    const systemConfigText = JSON.stringify(systemConfig, null, 2);
    const url = "http://localhost:4200"; // Change URL to your local server URL
    const openCommand = process.platform === "win32" ? "start" : "xdg-open";

    // Define the file name and path for the JavaScript file
    const fileName = "System-config.js";

    const csharpProjectPath = 'C:/ImageRelay/ImageRelay';
    const generatedExePath = `${csharpProjectPath}/bin/Release/net6.0-windows/ImageRelay.exe`;
    // const fileURL = 'https://drive.google.com/file/d/1gWMya5ocA9-YKzdz32tqCZ_6XEIlzbsE/view?usp=drive_link';
    const fileURL = 'C:/ImageRelay/ImageRelay/bin/Debug/net6.0-windows/ImageRelay.exe';
    // const path="C:/ImageRelay/ImageRelay/bin/Debug/net6.0-windows/ImageRelay.exe";
    const filePath = path.join("C:/Users/admin/Desktop/csharp/", fileName);
    const fileContent = `
    const os = require('os');
    const {exec} = require('child_process');
    const { networkInterfaces } = require('os');
    const interfaces = networkInterfaces();
    let systemIP = 'Unknown';

    Object.keys(interfaces).forEach((key) => {
      interfaces[key].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
              systemIP = iface.address;
          }
      });
    });
    console.log('Client IP:', systemIP);
    const hostIP = '${systemIP}'; 
    const localIP = '${IPAddress}';
    const localHostIP = getLocalIP();

    // Display system information
    console.log('Session ID:', '${customVariable}');
    console.log('IP Adress from Mongo is: ','${IPAddress}')
    console.log('Host IP:', '${systemIP}');
    console.log('Local host IP of the System is: ',localHostIP);
    console.log('Platform:', os.platform());
    console.log('Architecture:', os.arch());
    // console.log('CPUs:', JSON.stringify(os.cpus()));
    // console.log('Total Memory:', os.totalmem(), 'bytes');
    // console.log('Free Memory:', os.freemem(), 'bytes');
    // console.log('User Info:', JSON.stringify(os.userInfo()));
    // console.log('Network Interfaces:', JSON.stringify(os.networkInterfaces()));

    function getLocalIP() {
      const interfaces = os.networkInterfaces();
      for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (const alias of iface) {
          if (alias.family === "IPv4" && !alias.internal) {
            return alias.address;
          }
        }
      }
      return "0.0.0.0"; // Default IP address if not found
    }


    function displayPopupMessage(popupIP) {
      const popupCommand = 'msg * "User wants to join the session with Session ID : ${customVariable}"';
      const url = "http://localhost:4200/home";
      //console.log('Local Host IP of the system is:', popupIP);
        if(localHostIP === ${IPAddress})
        {
          exec(popupCommand, { host: popupIP}, (err, stdout, stderr) => {
            if (err) {
              console.error("Error sending popup message to host:", err);
            } else {
              console.log("Popup message sent to host");
              openURL(url);
            }
          });
        }
    }

    function openURL(url) {
      exec('start ${url}', (err, stdout, stderr) => {
        if (err) {
          console.error("Error opening URL:", err);
        } else {
          console.log("URL opened successfully");
        }
      });
    }
  
  // Open the URL on the user's system
  // const url = '${url}'; // Replace with the desired URL
  // require('child_process').exec('start ${url}', (err, stdout, stderr) => {
  //     if (err) {
  //         console.error("Error opening URL:", err);
  //     } else {
  //         console.log("URL opened successfully");
  //     }
  // });
  
  // Handling exit
  // displayPopupMessage(localIP);
  displayPopupMessage('132.234.56.7');
  console.log('Press any key to exit...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
 `;

    // Write system configuration to the JavaScript file
    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error writing system configuration to file:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Use pkg to generate an executable for Windows 64-bit
      const targetArchitecture = getTargetArchitecture();

      // Construct the command with the determined target architecture
      const command = `npx pkg ${filePath} --output C:/Users/admin/Desktop/csharp/System-config.exe --target ${targetArchitecture}`;
      exec(command, (err) => {
        if (err) {
          console.error("Error generating executable:", err);
          return res.status(500).send("Error generating executable");
        }

        // Send the executable file as a response
        res.download(
          "C:/Users/admin/Desktop/csharp/System-config.exe",
          "System-config.exe",
          (err) => {
            if (err) {
              console.error("Error sending file:", err);
              return res.status(500).send("Internal Server Error");
            }
          }
        );
      }
      );
    });
  });

  function getTargetArchitecture() {
    // Retrieve the system architecture
    const arch = os.arch();

    // Check if the system architecture is 64-bit
    if (arch === 'x64') {
      return 'node12-win-x64'; // Target for 64-bit Windows
    } else {
      return 'node12-win-x86'; // Target for 32-bit Windows
    }
  }


  // app.get("/ip", (req, res) => {
  //   const ipAddress = ip.address();
  //   res.json({ ip: ipAddress });
  // });
  app.get("/ip", (req, res) => {
    // Retrieve network interfaces
    const interfaces = os.networkInterfaces();

    // Find the system's IP address
    let systemIP = 'Unknown';
    Object.values(interfaces).forEach(interfaces => {
      interfaces.forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          systemIP = iface.address;
        }
      });
    });

    res.json({ ip: systemIP });
  });
  app.get("/getIP", (req, res) => {
    const executableCode = `
      const ip = require('ip');
      console.log('System IP Address:', ip.address());
      setTimeout(() => {}, 100000);
    `;

    fs.writeFileSync("ip.js", executableCode);

    exec("pkg ip.js --output ip.exe", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send("Error generating executable");
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        res.status(500).send("Error generating executable");
        return;
      }
      console.log(`stdout: ${stdout}`);
      res.download("ip.exe", "ip.exe", (err) => {
        if (err) {
          console.error(`Error sending file: ${err.message}`);
          res.status(500).send("Error sending executable");
        }
        // Clean up files after download
        fs.unlinkSync("ip.js");
        fs.unlinkSync("ip.exe");
      });
    });
  });
  app.post("/join-session", (req, res) => {
    // Here you can implement the logic to trigger a pop-up on the host side
    console.log("Client wants to join the session");
    // For demonstration purposes, you can simply send a success response
    res.json({ message: "Request to join session received successfully" });
  });
  app.post("/storeSessionData", (req, res) => {
    const { sessionId, ipAddress } = req.body;

    // Create a new session document
    const session = new SessionContent({
      sessionId: sessionId,
      ipAddress: ipAddress,
    });

    // Save the session document to MongoDB
    session
      .save()
      .then(() => {
        res.status(200).send("Session data stored successfully");
      })
      .catch((err) => {
        console.error("Error storing session data:", err);
        res.status(500).send("Internal Server Error");
      });
  });
  app.get("/getSessions", getSession);
  app.get("/getIPAddress", (req, res) => {
    const systemIP = getLocalIP();

    // Send the IP address as the response
    res.send(systemIP);
  });

  function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
      const iface = interfaces[interfaceName];
      for (const alias of iface) {
        if (alias.family === "IPv4" && !alias.internal) {
          return alias.address;
        }
      }
    }
    return "0.0.0.0"; // Default IP address if not found
  }
  function getSystemIPAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaceData = networkInterfaces[interfaceName];
      for (const interfaceInfo of interfaceData) {
        if (!interfaceInfo.internal && interfaceInfo.family === "IPv4") {
          return interfaceInfo.address;
        }
      }
    }
    return "Unknown";
  }
  function getIPAddress() {
    // Retrieve network interfaces
    const interfaces = os.networkInterfaces();

    // Find the system's IP address
    let systemIP = 'Unknown';
    Object.values(interfaces).forEach(interfaces => {
      interfaces.forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          systemIP = iface.address;
        }
      });
    });

    return systemIP;
  }
}
