import questionManagementRoute from "./questionManagement.route.js";
import examManagementRoute from "./examManagement.route.js";
import questionTypeManagementRoute from "./questionTypeManagement.route.js";
import audioManagementRoute from "./audioManagement.route.js";
import classroomManagementRoute from "./classroomManagement.route.js";
import {
  protectedRoute,
  isStudent,
  isAdmin,
  isTeacher,
} from "../../middlewares/protectedRoute.middleware.js";


const indexTeacher = (app) => {
  app.use(protectedRoute);
  app.use(isTeacher);
  app.use("/teacher", questionManagementRoute);

  app.use("/teacher/exam", examManagementRoute);

  app.use("/teacher/question-types", questionTypeManagementRoute);

  app.use("/teacher/audio", audioManagementRoute);

  app.use("/teacher/classroom", classroomManagementRoute);
};
export default indexTeacher;
