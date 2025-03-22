import homeRoute from "./home.route.js";
import authRoute from "./auth.route.js";
import questionRoute from "./question.route.js";
import examRoute from "./exam.route.js";
import resultRoute from "./result.route.js";
import flashCardRoute from "./flashcard.route.js";
<<<<<<< HEAD
import listeningExamRoute from "./listening-exams.route.js";
=======
import listeningExamRoute from "./listening-exams.js";
import Classroom from "./classroom.route.js";
>>>>>>> eb8748e40074c60161288176a42f60ed8a969926
import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";

const indexClient = (app) => {
  app.use("/auth", authRoute);
  app.use(protectedRoute);
  app.use("/question", questionRoute);
  app.use("/exam", examRoute);
  app.use("/result", resultRoute);
  app.use("/flashcard", flashCardRoute);
  app.use("/listening-exam", listeningExamRoute);
  app.use("/classroom", Classroom);
  app.use("/", homeRoute);

};
export default indexClient;
