import express from "express";
import { uploadFile } from "../../controllers/teacher/audioManagement.controller.js";
import multer from "multer";
import upload from "../../middlewares/teacher/upLoadCloud.middleware.js";

const router = express.Router();
const fileUpload = multer();

router.post("/upload",fileUpload.single("filePath"), upload, uploadFile);

export default router;