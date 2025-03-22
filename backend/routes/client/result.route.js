import express from "express";
const router = express.Router();

import { deleteResult, getAllResults, getDontCompletedExam, getWrongQuestions, savedExam, submitExam } from "../../controllers/client/result.controller.js";
import { validateExamData } from "../../validate/result/validateExamData.js";

router.post("/submit",validateExamData, submitExam);

router.get("/", getAllResults);

router.patch("/delete/:id", deleteResult);

router.get("/wrong-questions/:resultId", getWrongQuestions);

// Route mới cho getDontCompletedExam
router.get("/check-incomplete-exams", getDontCompletedExam);

// Route mới cho savedExam
router.patch("/save", savedExam);
export default router;
