import express from "express";
const router = express.Router();

import { deleteResult, getAllResults, getWrongQuestions, submitExam } from "../../controllers/client/result.controller.js";

router.post("/submit", submitExam);

router.get("/", getAllResults);

router.patch("/delete/:id", deleteResult);

router.get("/wrong-questions/:resultId", getWrongQuestions);


export default router;
