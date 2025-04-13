import express from "express";
import {
  getAllResults,
  getAllListeningResults,
  submitExam,
  submitListeningExam,
  deleteResult,
  getWrongQuestions,
  getDontCompletedExam,
  savedExam,
  saveSingleAnswer,
} from "../../controllers/client/result.controller.js";

const router = express.Router();

// Routes for Exam results
router.get("/", getAllResults);
router.post("/submit", submitExam);
router.patch("/delete/:id", deleteResult);
router.get("/wrong-questions/:resultId", getWrongQuestions);
router.get("/dont-completed", getDontCompletedExam);
router.patch("/save", savedExam);

// Routes for ListeningExam results
router.get("/listening", getAllListeningResults);
router.post("/listening/submit", submitListeningExam);

// [POST]: /result/save-single-answer
router.post("/save-single-answer", saveSingleAnswer);

export default router;