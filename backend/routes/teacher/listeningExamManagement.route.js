import express from "express";
import { createListeningExamController, deleteExamController, getAllListeningExamsController, getAllListeningExamsOfMyselfController, updateListeningExamController } from "../../controllers/teacher/listeningExamManagement.controller.js";
import { verifyToken } from "../../utils/generateToken.util.js";
import { listeningExamMiddleware } from "../../middlewares/teacher/listeningExam.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllListeningExamsController);

router.get('/my-self', getAllListeningExamsOfMyselfController);

router.post('/create', createListeningExamController);

router.patch('/update/:examId', listeningExamMiddleware, updateListeningExamController);

router.delete('/delete/:examId',listeningExamMiddleware,  deleteExamController);


export default router;