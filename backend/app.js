import express from "express";
import cors from "cors";
import { redisService } from "./config/redis.config.js";
// import { crawlData } from "./utils/crawl.util.js";

import { connect } from "./config/db.config.js";

import { ENV_VARS } from "./config/envVars.config.js";

import cookieParser from "cookie-parser";
import indexClient from "./routes/client/index.route.js";
import indexTeacher from "./routes/teacher/index.route.js";
connect();
const app = express();
// Configure CORS

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your client's origin
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Include this if you need to send cookies with requests
  })
);
app.use(express.json());
app.use(cookieParser());
await redisService.connect();
indexTeacher(app);

indexClient(app);

app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const port = ENV_VARS.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
