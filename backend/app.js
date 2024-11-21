import express from "express";

import { crawlData } from "./utils/crawl.util.js";

import { connect } from "./config/db.config.js";

import { ENV_VARS } from "./config/envVars.config.js";

import cookieParser from "cookie-parser";

connect();

// const url = "https://study4.com/tests/tieng-anh-thptqg/";

// crawlData(url);

const app = express();

app.use(express.json());
app.use(cookieParser());

const port = ENV_VARS.PORT;

import index from "./routes/client/index.route.js";
index(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
