import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.util.js";
import { dbConnection } from "./database/db.controller.js";
import { routes } from "./routes/server.routes.js";

// const routes = require("./routes/server.routes.js");


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  "https://orage-remote-nngu.vercel.app",
  "http://localhost:4200",
  "http://remote.ultimateitsolution.site",
  "http://remote.arjit.tech",
  "http://localhost:5000",
  "http://139.59.12.225"
];
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};
app.use(cors(corsOptions));

// Routes
routes(app);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server started at port ${PORT}`, {
    meta: {
      method: "app.listen",
    },
  });
  dbConnection(process.env.MONGO_DB_URI);
});
