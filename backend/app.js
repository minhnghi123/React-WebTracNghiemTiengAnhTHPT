import express from "express";
import cors from "cors";
import { redisService } from "./config/redis.config.js";
// import { crawlData } from "./utils/crawl.util.js";
import http from "http";
import { Server as socketIo } from "socket.io";
import handleErrorReport from "./socket/client/handleErrorReport.js"; // Import handleErrorReport

import { connect } from "./config/db.config.js";

import { ENV_VARS } from "./config/envVars.config.js";

import cookieParser from "cookie-parser";
import indexClient from "./routes/client/index.route.js";
import indexTeacher from "./routes/teacher/index.route.js";
import indexAdmin from "./routes/admin/index.route.js";
connect();
const app = express();

// Socket IO
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://localhost:3000",
     "https://react-web-trac-nghiem-tieng-anh-thpt.vercel.app", // FE domain
      "https://react-webtracnghiemtienganhthpt-ke5j.onrender.com", // BE domain
    ],// Allow requests from this origin
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
  },
});
global._io = io;

// Gọi handleErrorReport
handleErrorReport(); // Thêm dòng này
// End Socket IO

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://localhost:3000",
      "https://react-web-trac-nghiem-tieng-anh-thpt.vercel.app", // FE domain
      "https://react-webtracnghiemtienganhthpt-ke5j.onrender.com", // BE domain
    ],
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
await redisService.connect();

indexClient(app);
indexTeacher(app);
indexAdmin(app);

app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const port = ENV_VARS.PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
