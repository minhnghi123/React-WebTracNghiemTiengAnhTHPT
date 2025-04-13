import verificationTeacherRoute from "./verification-teacher.route.js";
import questionTypeManagementRoute from "../admin/questionTypeManagement.route.js";
import {
  protectedRoute,
  isAdmin,
} from "../../middlewares/protectedRoute.middleware.js";

const indexAdmin = (app) => {
  app.use(protectedRoute);
  app.use(isAdmin);
  app.use("/admin/verification-teacher", verificationTeacherRoute);
  app.use("/admin/question-types", questionTypeManagementRoute);
};
export default indexAdmin;
