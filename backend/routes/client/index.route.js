import homeRoute from "./home.route.js";
import authRoute from "./auth.route.js";
import questionRoute from "./question.route.js";
import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";
const indexClient = (app) => {
  app.use("/auth", authRoute);
  app.use("/question", questionRoute);
  app.use("/", protectedRoute, homeRoute);
};
export default indexClient;
