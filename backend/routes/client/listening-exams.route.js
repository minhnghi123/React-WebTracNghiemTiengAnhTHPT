import express from "express";
const router = express.Router();
import { index } from "../../controllers/client/listening-exam.controller.js";

router.get("/", index );

export default router;