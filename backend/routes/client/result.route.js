import express from "express";
const router = express.Router();

import { deleteResult, getAllResults, getDontCompletedExam, getWrongQuestions, savedExam, submitExam ,saveSingleAnswer, reportViolation } from "../../controllers/client/result.controller.js";
import { validateExamData } from "../../validate/result/validateExamData.js";

router.post("/submit",validateExamData, submitExam);

router.get("/", getAllResults);

router.patch("/delete/:id", deleteResult);

router.get("/wrong-questions/:resultId", getWrongQuestions);

// Route mới cho getDontCompletedExam
router.get("/check-incomplete-exams", getDontCompletedExam);

// Route mới cho savedExam
router.patch("/save", savedExam);
// [POST]: /result/save-single-answer
router.post("/save-single-answer", saveSingleAnswer);

// Route mới cho reportViolation
router.post("/report-violation", reportViolation);

export default router;
