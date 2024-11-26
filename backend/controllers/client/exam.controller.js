import Exam from "../../models/Exam.model.js";
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export const detailExam = async (req, res) => {
  try {
    const { slug } = req.params;
    const exam = await Exam.findOne({ slug }).populate("questions");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json({ code: 200, exam });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message });
  }
};
export const joinedExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.examId }).populate(
      "questions"
    );
    if (!exam) {
      return res.status(404).json({ message: "Đề thi không tồn tại." });
    }
    // const now = new Date();
    // if (now < exam.startTime || (exam.endTime && now > exam.endTime)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Đề thi không khả dụng hoặc đã kết thúc." });
    // }
    // Đảo câu hỏi
    const shuffledQuestions = shuffleArray(exam.questions);
    console.log(shuffledQuestions);
    // Đảo đáp án cho từng câu hỏi
    const questionsWithShuffledAnswers = shuffledQuestions.map((question) => {
      return {
        ...question.toObject(),
        answers: shuffleArray(question.answers),
      };
    });
    res.status(200).json({
      code: 200,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questions: questionsWithShuffledAnswers,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: 400, message: "Lỗi khi tham gia đề thi." });
  }
};
