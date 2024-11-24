import express from "express";
const router = express.Router();
//crawldata and save to db and excels
import { questionPost } from "../../controllers/client/question.controller.js";
router.post("/post", questionPost);
export default router;
