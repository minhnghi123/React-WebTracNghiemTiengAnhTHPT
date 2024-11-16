import homeRoute from "./home.route.js";
import authRoute from "./auth.route.js";
const index = (app) => {
  app.use("/", homeRoute);
  app.use("/auth", authRoute);
};
export default index;
