import express from "express";
import * as controller from "../../controllers/client/flashcard.controller.js";
const router = express.Router();

router.get("/", controller.index);
router.post("/create", controller.createPost);
router.get("/:idSet", controller.detailSet);

export default router;
