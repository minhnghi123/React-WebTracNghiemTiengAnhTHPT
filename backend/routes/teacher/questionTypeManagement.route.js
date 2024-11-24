import express from "express";
import {
  index,
  createPost,
  update,
  updatePatch,
  deletePatch,
} from "../../controllers/teacher/questionTypeManagement.controller.js";
import { questionTypeCreate } from "../../validate/teacher/questionTypeCreate.validate.js";
const router = express.Router();
router.get("/", index);
router.post("/create", questionTypeCreate, createPost);
router.get("/update/:id", update);
router.patch("/update/:id", updatePatch);
router.patch("/delete/:id", deletePatch);

export default router;
