import express from "express";
import * as controller from "../../controllers/client/flashcard.controller.js";
const router = express.Router();

// router.get("");
router.post("/create", controller.createPost);

export default router;
