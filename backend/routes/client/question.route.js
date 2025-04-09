import express from "express";
const router = express.Router();
//crawldata and save to db and excels
import { questionPost, getQuestionForStudent } from "../../controllers/client/question.controller.js";
router.post("/post", questionPost);

// Route for students to fetch question details
router.get("/student/:id", getQuestionForStudent);

export default router;
