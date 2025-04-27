import questionManagementRoute from "./questionManagement.route.js";
import examManagementRoute from "./examManagement.route.js";
import questionTypeManagementRoute from "./questionTypeManagement.route.js";
import audioManagementRoute from "./audioManagement.route.js";
import classroomManagementRoute from "./classroomManagement.route.js";
import listeningQuestionManagementRoute from "./listeningQuestionManagement.route.js";
import listeningExamManagementRoute from "./listeningExamManagement.route.js";
import {
  protectedRoute,
  isTeacher,
  isAdmin,
} from "../../middlewares/protectedRoute.middleware.js";


const indexTeacher = (app) => {
  app.use(protectedRoute); // Đảm bảo người dùng đã đăng nhập
  app.use("/teacher/listening-exam", isTeacher, listeningExamManagementRoute);
  app.use("/teacher/listening-question", isTeacher, listeningQuestionManagementRoute); // Đảm bảo chỉ giáo viên có quyền truy cập
  app.use("/teacher", isTeacher, questionManagementRoute);

  app.use("/teacher/exam", isTeacher, examManagementRoute);

  app.use("/teacher/audio", isTeacher, audioManagementRoute);

  app.use("/teacher/classroom", isTeacher, classroomManagementRoute);

  app.use("/teacher/question-types", questionTypeManagementRoute);
};
export default indexTeacher;
