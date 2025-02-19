import express from "express";
import { verifyToken } from "../../utils/generateToken.util.js";
import { createListeningQuestion, createMultipleListeningQuestions, deleteListeningQuestion, getAllListeningQuestionsController, getListeningQuestionController, updateListeningQuestion } from "../../controllers/teacher/listeningQuestionManagement.controller.js";
import { listeningQuestionMiddleware } from "../../middlewares/teacher/listeningQuestion.middleware.js"

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllListeningQuestionsController );

router.get("/:id", getListeningQuestionController );

router.post("/create", createListeningQuestion );

router.post("/create-multi", createMultipleListeningQuestions );

router.patch("/update/:id", listeningQuestionMiddleware, updateListeningQuestion );

router.patch("/delete/:id",listeningQuestionMiddleware, deleteListeningQuestion );





export default router;