import questionManagementRoute from "./questionManagement.route.js";
const indexTeacher = (app) => {
  app.use("/teacher", questionManagementRoute);
};
export default indexTeacher;
