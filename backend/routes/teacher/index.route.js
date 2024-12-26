import questionManagementRoute from "./questionManagement.route.js";
import examManagementRoute from "./examManagement.route.js";
import questionTypeManagementRoute from "./questionTypeManagement.route.js";
import audioManagementRoute from "./audioManagement.route.js";
import { isTeacher } from "../../middlewares/teacher/isTeacherMiddleware.js";
const indexTeacher = (app) => {
  app.use(isTeacher);
  app.use("/teacher", questionManagementRoute);

  app.use("/teacher/exam", examManagementRoute);

  app.use("/teacher/question-types", questionTypeManagementRoute);

  app.use("/teacher/audio", audioManagementRoute);
};
export default indexTeacher;
