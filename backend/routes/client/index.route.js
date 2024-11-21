import homeRoute from "./home.route.js";
import authRoute from "./auth.route.js";
import questionRoute from "./question.route.js";
const index = (app) => {
  app.use("/", homeRoute);
  app.use("/auth", authRoute);
  app.use("/question", questionRoute);
};
export default index;
