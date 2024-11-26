import express from "express";
const router = express.Router();
import {
  joinedExam,
  detailExam,
} from "../../controllers/client/exam.controller.js";
router.get("/detail/:slug", detailExam);
router.get("/exam-practice/:examId", joinedExam);

export default router;
