import express from "express";
const router = express.Router();
import { home } from "../../controllers/client/home.controller.js";
router.get("/", home);
export default router;
