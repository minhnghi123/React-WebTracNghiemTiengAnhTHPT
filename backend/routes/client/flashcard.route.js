import express from "express";
import * as controller from "../../controllers/client/flashcard.controller.js";
const router = express.Router();

router.get("/", controller.index);
router.post("/create", controller.createPost);
router.patch("/:idSet", controller.updateSet);
router.get("/:idSet", controller.detailSet);
router.delete("/:idSet", controller.deleteSet);
export default router;
