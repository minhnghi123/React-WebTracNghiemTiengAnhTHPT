import express from "express";
import {
  index,
  createPost,
  update,
  updatePatch,
  deletePatch,
  getAllQuestionTypes,
} from "../../controllers/admin/questionTypeManagement.controller.js";
import { questionTypeCreate } from "../../validate/teacher/questionTypeCreate.validate.js";
import { protectedRoute, isAdmin } from "../../middlewares/protectedRoute.middleware.js";

const router = express.Router();

router.use(protectedRoute);
router.use(isAdmin);

router.get("/", getAllQuestionTypes);
router.post("/create", questionTypeCreate, createPost);
router.get("/update/:id", update);
router.patch("/update/:id", updatePatch);
router.patch("/delete/:id", deletePatch);

export default router;
