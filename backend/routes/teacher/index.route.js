import questionManagementRoute from "./questionManagement.route.js";
import examManagementRoute from "./examManagement.route.js";


const indexTeacher = (app) => {
  app.use("/teacher", questionManagementRoute);

  app.use("/teacher/exam", examManagementRoute);
};
export default indexTeacher;
