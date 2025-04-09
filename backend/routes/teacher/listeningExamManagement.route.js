import express from "express";
import {
  createListeningExamController,
  deleteExamController,
  getAllListeningExamsController,
  getAllListeningExamsOfMyselfController,
  updateListeningExamController,
  importListeningExamController,
} from "../../controllers/teacher/listeningExamManagement.controller.js";
import { verifyToken } from "../../utils/generateToken.util.js";
import { listeningExamMiddleware } from "../../middlewares/teacher/listeningExam.middleware.js";
import multer from "multer";
import upload, {
  uploadMultiple,
} from "../../middlewares/teacher/upLoadCloud.middleware.js";

const fileUpload = multer();
const router = express.Router();

router.use(verifyToken);

router.get("/", getAllListeningExamsController);

router.get("/my-self", getAllListeningExamsOfMyselfController);

router.post("/create", createListeningExamController);

router.patch(
  "/update/:examId",
  listeningExamMiddleware,
  updateListeningExamController
);

router.delete("/delete/:examId", deleteExamController);

router.post(
  "/import-excel",
  fileUpload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "examFile", maxCount: 1 },
  ]),
  uploadMultiple,
  importListeningExamController
);
export default router;
