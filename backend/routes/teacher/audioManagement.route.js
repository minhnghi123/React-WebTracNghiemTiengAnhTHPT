import express from "express";
import { createAudio, getAllAudios, softDeleteAudio, updateAudio  } from "../../controllers/teacher/audioManagement.controller.js";
import multer from "multer";
import upload from "../../middlewares/teacher/upLoadCloud.middleware.js";

const router = express.Router();
const fileUpload = multer();

router.get("/", getAllAudios );

router.post("/upload",fileUpload.single("filePath"), upload, createAudio );

router.patch("/update/:id",fileUpload.single("filePath"), upload, updateAudio );

router.patch("/delete/:id", softDeleteAudio );


export default router;