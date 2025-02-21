import express from "express";
import fileUpload from "express-fileupload";
import {
  questionManagement,
  createPost,
  detail,
  update,
  deletePatch,
  updatePatch,
  importExcel,
} from "../../controllers/teacher/questionManagement.controller.js";
import { questionCreate } from "../../validate/teacher/questionCreate.validate.js";

const router = express.Router();

// Cấu hình cho fileUpload
const uploadOpts = {
  useTempFiles: true,
  tempFileDir: "/tmp/", // thư mục tạm thời cho các tệp tải lên
};

// Các route của hệ thống
router.get("/question-management", questionManagement);
router.get("/question/detail/:id", detail);
router.get("/question/update/:id", update);
router.patch("/question/delete/:id", deletePatch);
router.patch("/question/update/:id", updatePatch);

// Route cho tạo mới câu hỏi với validation
router.post("/question/create", questionCreate, createPost);

// Route cho import câu hỏi từ file Excel
router.post("/question/import-excel", fileUpload(uploadOpts), importExcel);
// router.post("/question/import-pdf", fileUpload(uploadOpts), importPdf);

export default router;
