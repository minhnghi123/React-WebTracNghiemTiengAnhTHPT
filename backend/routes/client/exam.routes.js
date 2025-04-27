import express from "express";
import {
  index,
  detailExam,
  joinedExam,
  getListeningExams,
  detailListeningExam,
  joinListeningExam,
  calculateListeningExamScore,
} from "../../controllers/client/exam.controller.js";

const router = express.Router();

// Routes for Exam
router.get("/", index);
router.get("/:slug", detailExam);
router.post("/join/:examId", joinedExam);

// Routes for ListeningExam
router.get("/listening", getListeningExams);
router.get("/listening/:slug", detailListeningExam);
router.post("/listening/join/:examId", joinListeningExam);

export default router;
