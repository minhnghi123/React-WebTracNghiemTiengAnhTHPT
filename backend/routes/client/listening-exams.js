import express from "express";
const router = express.Router();
import { test } from "../../controllers/client/listening-exam.controller.js";

router.get("/", test);

export default router;