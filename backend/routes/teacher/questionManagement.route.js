import express from "express";
import {
  questionManagement,
  createPost,
  detail,
  update,
  deletePatch,
  updatePatch,
} from "../../controllers/teacher/questionManagement.controller.js";
import { questionCreate } from "../../validate/teacher/questionCreate.validate.js";
const router = express.Router();
router.get("/question-management", questionManagement);

router.get("/question/detail/:id", detail);
router.get("/question/update/:id", update);
router.patch("/question/delete/:id", deletePatch);
router.patch("/question/update/:id", updatePatch);
router.post("/question/create", questionCreate, createPost);

export default router;
