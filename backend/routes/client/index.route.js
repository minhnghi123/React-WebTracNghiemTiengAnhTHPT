import homeRoute from "./home.route.js";
import authRoute from "./auth.route.js";
import questionRoute from "./question.route.js";
import examRoute from "./exam.route.js";
import resultRoute from "./result.route.js";
import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";

const indexClient = (app) => {
  app.use("/auth", authRoute);
  app.use("/question", questionRoute);
  app.use("/exam", examRoute);
  app.use("/result", resultRoute);
  app.use("/", protectedRoute, homeRoute);
};
export default indexClient;
