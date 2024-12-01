import Result from "../../models/Result.model.js";
import Exam from "../../models/Exam.model.js";

// [GET]: result/
export const getAllResults = async (req, res) => {
  try {
    const fillter = {
      isDeleted: false
    }

    const results = await Result.find(fillter).populate("examId");
    res.status(200).json({
      code: 200,
      data : results
    }
      
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error });
  }
};


// [POST]: /result/submit  
export const submitExam = async (req, res) => {
  try {
    const { examId, userId, answers } = req.body;


    // Tìm bài kiểm tra và danh sách câu hỏi liên quan
    const exam = await Exam.findOne({ _id: examId }).populate("questions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;
    const questionDetails = [];

    // Duyệt qua danh sách câu trả lời
    for (const answer of answers) {
      const { questionId, selectedAnswerId } = answer;

      // Lấy câu hỏi từ danh sách bài thi
      const question = exam.questions.find(
        (q) => String(q._id) === String(questionId)
      );

      if (!question) {
        return res.status(400).json({ 
          code: 400,
          message: `Question ${questionId} not found in the exam.` });
      }

      // Lấy đáp án đúng từ câu hỏi
      const correctAnswerObj = question.answers.find((ans) => ans.isCorrect);

      if (!correctAnswerObj) {
        return res
          .status(500)
          .json({ message: `Question ${questionId} has no correct answer.` });
      }

      // So sánh đáp án được chọn với đáp án đúng
      const isCorrect = String(correctAnswerObj._id) === String(selectedAnswerId);

      if (isCorrect) {
        correctAnswer++;
        score++;
      } else {
        wrongAnswer++;
      }

      // Lưu chi tiết câu hỏi
      questionDetails.push({
        questionId: question._id,
        content: question.content,
        answers: question.answers,
        selectedAnswerId,
        isCorrect,
      });
    }
    // Tạo kết quả mới
    const result = new Result({
      examId,
      userId,
      score,
      correctAnswer,
      wrongAnswer,
      questions: questionDetails,
    });

    // Lưu vào database
    await result.save();

    // Phản hồi kết quả về client
    res.status(200).json({
      code: 200,
      message: "Exam submitted successfully!",
      score,
      correctAnswer,
      wrongAnswer,
      details: questionDetails,
    });
  } catch (error) {
    console.error("Error processing exam:", error);
    res.status(500).json({ message: "Error submitting exam.", error });
  }
};

// [PATCH]: /result/delete/:id
export const deleteResult = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Result.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    res.status(200).json({
      code: 200,
      message: "Result soft-deleted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      message: "Failed to soft-delete result", error });
  }
};

// [GET]: /result/wrong-questions/:resultId
export const getWrongQuestions = async (req, res) => {
  const { resultId } = req.params;

  try {
    // Tìm kết quả bài kiểm tra
    const result = await Result.findById(resultId).populate("questions.questionId");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Lọc ra các câu sai
    const wrongQuestions = result.questions.filter((q) => !q.isCorrect);

    res.status(200).json({
      code: 200,
      message: "Wrong questions fetched successfully.",
      wrongQuestions,
    });
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      message: "Failed to fetch wrong questions", 
      error });
  }
};




 
