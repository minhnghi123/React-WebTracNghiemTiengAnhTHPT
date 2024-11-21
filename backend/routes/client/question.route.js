import express from "express";
const router = express.Router();
import { questionPost } from "../../controllers/client/question.controller.js";
router.post("/post", questionPost);
export default router;
