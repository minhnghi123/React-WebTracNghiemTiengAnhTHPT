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
  importExamFromExcel,
} from "../../controllers/teacher/examManagement.controller.js";
import multer from "multer";
import upload, {
  uploadMultiple,
} from "../../middlewares/teacher/upLoadCloud.middleware.js";

const router = express.Router();
const fileUpload = multer();
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
//import exam with both passage and exam file
router.post(
  "/import-exam",
  fileUpload.fields([
    { name: "passageFile", maxCount: 1 },
    { name: "examFile", maxCount: 1 },
  ]),
  uploadMultiple,
  importExamFromExcel
);
//import exam with only exam file
router.post(
  "/import-exam/exam-only",
  fileUpload.fields([{ name: "examFile", maxCount: 1 }]),
  uploadMultiple,
  importExamFromExcel
);

export default router;
