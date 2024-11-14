import express from "express";
import dotenv from "dotenv";
import { crawlData } from "./utils/crawl.util.js";
const url = "https://study4.com/";
crawlData(url);
dotenv.config();

const app = express();

app.use(express.json());

const port = process.env.PORT || 5000;

import index from "./routes/client/index.route.js";
index(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
