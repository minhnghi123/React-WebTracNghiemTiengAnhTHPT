import express from "express";
import {
  createExam,
  deleteExam,
  getAllExams,
  getExamDetail,
  setExamSchedule,
  toggleExamVisibility,
  updateExam,
  autoGenerateExam,
  exportExamIntoWord,
  copyExamFromOthers,
  importExamFromWord,
} from "../../controllers/teacher/examManagement.controller.js";

const router = express.Router();

router.get("/", getAllExams);

router.get("/detail/:slug", getExamDetail);

router.post("/create", createExam);

router.patch("/update/:slug", updateExam);

router.delete("/delete/:id", deleteExam);

router.patch("/toggle-visibility/:id", toggleExamVisibility);

router.patch("/schedule/:id", setExamSchedule);

router.post("/auto-generate-exam", autoGenerateExam);

router.post("/export-exam", exportExamIntoWord);

router.post("/copy-exam", copyExamFromOthers);

router.post("/import-exam", importExamFromWord);

export default router;
