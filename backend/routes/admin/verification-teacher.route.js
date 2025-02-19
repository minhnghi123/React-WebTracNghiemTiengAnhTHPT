import express from "express";
import * as controller from "../../controllers/admin/verification-teacher.controller.js";
const router = express.Router();
router.get("/", controller.getVerificationRequests);
router.get("/detail/:requestId", controller.getDetailVerificationRequest);
router.post("/approve/:requestId", controller.approveTeacher);
router.post("/reject/:requestId", controller.rejectTeacher);
export default router;
