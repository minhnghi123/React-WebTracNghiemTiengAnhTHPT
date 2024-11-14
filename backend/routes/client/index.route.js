import homeRoute from "./home.route.js";
const index = (app) => {
  app.use("/", homeRoute);
};
export default index;
