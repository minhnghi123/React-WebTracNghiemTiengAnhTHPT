import express from "express";
import { questionManagement } from "../../controllers/teacher/questionManagement.controller.js";

const router = express.Router();
router.get("/question-management", questionManagement);

export default router;
