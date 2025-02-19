import homeRoute from "./home.route.js";
import authRoute from "./auth.route.js";
import questionRoute from "./question.route.js";
import examRoute from "./exam.route.js";
import resultRoute from "./result.route.js";
import flashCardRoute from "./flashcard.route.js";
import listeningExamRoute from "./listening-exams.js";
import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";

const indexClient = (app) => {
  app.use("/auth", authRoute);
  app.use(protectedRoute);
  app.use("/question", questionRoute);
  app.use("/exam", examRoute);
  app.use("/result", resultRoute);
  app.use("/flashcard", flashCardRoute);
  app.use("/listening-exam", listeningExamRoute);
  app.use("/", homeRoute);
};
export default indexClient;
