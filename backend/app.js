import express from "express";

import { crawlData, crawlDataFromVietJack } from "./utils/crawl.util.js";

import { connect } from "./config/db.config.js";

import { ENV_VARS } from "./config/envVars.config.js";

connect();

// const url = "https://study4.com/";
const url = "https://vietjack.com/trac-nghiem-tieng-anh-12/";
// crawlData(url);
crawlDataFromVietJack(url);

const app = express();

app.use(express.json());

const port = ENV_VARS.PORT;

import index from "./routes/client/index.route.js";
index(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
