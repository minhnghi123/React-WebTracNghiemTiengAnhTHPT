import express from "express";
import cors from "cors";

// import { crawlData } from "./utils/crawl.util.js";

import { connect } from "./config/db.config.js";

import { ENV_VARS } from "./config/envVars.config.js";

import cookieParser from "cookie-parser";
import indexClient from "./routes/client/index.route.js";
import indexTeacher from "./routes/teacher/index.route.js";
connect();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

indexTeacher(app);
indexClient(app);

app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const port = ENV_VARS.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
