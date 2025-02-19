import questionManagementRoute from "./questionManagement.route.js";
import examManagementRoute from "./examManagement.route.js";
import questionTypeManagementRoute from "./questionTypeManagement.route.js";
import audioManagementRoute from "./audioManagement.route.js";
import classroomManagementRoute from "./classroomManagement.route.js";
import listeningQuestionManagementRoute from "./listeningQuestionManagement.route.js";
import {
  protectedRoute,
  isStudent,
  isAdmin,
  isTeacher,
} from "../../middlewares/protectedRoute.middleware.js";


const indexTeacher = (app) => {
  app.use(protectedRoute);
  app.use("/teacher", isTeacher, questionManagementRoute);

  app.use("/teacher/exam", isTeacher, examManagementRoute);

  app.use("/teacher/question-types", isTeacher, questionTypeManagementRoute);

  app.use("/teacher/audio", isTeacher, audioManagementRoute);

<<<<<<< HEAD
  app.use("/teacher/classroom", classroomManagementRoute);

  app.use("/teacher/listening-question", listeningQuestionManagementRoute);

=======
  app.use("/teacher/classroom", isTeacher, classroomManagementRoute);
>>>>>>> 8ee91acd81dee15bf5d78c5dac07b80c018a7346
};
export default indexTeacher;
