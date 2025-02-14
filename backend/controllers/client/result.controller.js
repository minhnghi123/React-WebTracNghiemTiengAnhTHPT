import Result from "../../models/Result.model.js";
import Exam from "../../models/Exam.model.js";

// [GET]: result/
export const getAllResults = async (req, res) => {
  try {
    const fillter = {
      isDeleted: false,
    };

    const results = await Result.find(fillter).populate("examId");
    res.status(200).json({
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error });
  }
};

// [POST]: /result/submit
export const submitExam = async (req, res) => {
  try {
    const { examId, userId, answers } = req.body;

    // Tìm bài kiểm tra và các câu hỏi liên quan
    const exam = await Exam.findOne({ _id: examId }).populate({
      path: "questions",
      populate: {
        path: "questionType",
        select: "name",
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;
    const questionDetails = [];

    // Duyệt qua từng câu trả lời người dùng
    for (const answer of answers) {
      const { questionId, selectedAnswerId, userAnswer } = answer;

      // Tìm câu hỏi tương ứng trong bài thi
      const question = exam.questions.find(
        (q) => String(q._id) === String(questionId)
      );

      if (!question) {
        return res.status(400).json({
          code: 400,
          message: `Question ${questionId} not found in the exam.`,
        });
      }

      let isCorrect = false;
      let detail = {};

      // Xử lý dựa theo loại câu hỏi (theo tên của questionType)
      switch (question.questionType.name) {
        case "Fill in the Blanks":
          // Nếu là câu hỏi điền khuyết có nhiều blank thì userAnswer phải là mảng
          if (Array.isArray(userAnswer)) {
            let correctCount = 0;
            // Lấy mảng đáp án đúng từ từng phần tử của câu hỏi
            const correctAnswers = question.answers.map(
              (ans) => ans.correctAnswerForBlank
            );
            // So sánh từng blank
            const userAnswersDetail = userAnswer.map((ua, index) => {
              const correctAns = correctAnswers[index]
                ? correctAnswers[index].trim().toLowerCase()
                : "";
              const userAns = ua ? ua.trim().toLowerCase() : "";
              const answerIsCorrect = correctAns === userAns;
              if (answerIsCorrect) correctCount++;
              return {
                userAnswer: ua,
                // Nếu cấu trúc luôn theo thứ tự, ta có thể dùng index để tham chiếu đáp án
                answerId: question.answers[index]?._id,
                isCorrect: answerIsCorrect,
              };
            });
            isCorrect = correctCount === question.answers.length;

            detail = {
              questionId: question._id,
              content: question.content,
              answers: question.answers,
              // Lưu mảng kết quả của từng blank
              userAnswers: userAnswersDetail,
              correctAnswerForBlank: correctAnswers,
              audio: question.audio || null,
              isCorrect,
            };
          } else if (question.audio) {
            // Trường hợp câu hỏi nghe điền khuyết
            const correctAnswers = question.answers
              .map((ans) => ({
                correctAnswer: ans.correctAnswerForBlank,
                answerId: ans._id,
              }))
              .filter((ans) => Boolean(ans.correctAnswer));

            if (!correctAnswers.length) {
              return res.status(500).json({
                message: `Question ${questionId} has no correct answers.`,
              });
            }

            if (!Array.isArray(userAnswer)) {
              return res.status(400).json({
                message: `Invalid format for userAnswer. It should be an array.`,
              });
            }

            const userAnswersDetail = userAnswer.map((ua) => {
              const matchedAnswer = correctAnswers.find(
                (correct) =>
                  ua.trim().toLowerCase() === correct.correctAnswer.trim().toLowerCase()
              );
              return {
                userAnswer: ua,
                answerId: matchedAnswer ? matchedAnswer.answerId : null,
                isCorrect: !!matchedAnswer,
              };
            });

            const correctCount = userAnswersDetail.filter(
              (ans) => ans.isCorrect
            ).length;
            isCorrect = correctCount === correctAnswers.length;

            detail = {
              questionId: question._id,
              content: question.content,
              answers: question.answers,
              userAnswers: userAnswersDetail,
              correctAnswerForBlank: correctAnswers.map(
                (correct) => correct.correctAnswer
              ),
              audio: question.audio,
              isCorrect,
            };
          }
          break;

        case "Multiple Choice Questions":
          const correctAnswerObj = question.answers.find((ans) => ans.isCorrect);
          if (!correctAnswerObj) {
            return res.status(500).json({
              message: `Question ${questionId} has no correct answer.`,
            });
          }
          isCorrect =
            selectedAnswerId &&
            String(correctAnswerObj._id) === String(selectedAnswerId);

          detail = {
            questionId: question._id,
            content: question.content,
            answers: question.answers,
            selectedAnswerId,
            // Dành cho câu hỏi trắc nghiệm, lưu userAnswer dưới dạng ID của đáp án đã chọn
            userAnswers: [{ userAnswer: selectedAnswerId }],
            correctAnswerForBlank: null,
            audio: question.audio || null,
            isCorrect,
          };
          break;

        default:
          return res.status(400).json({
            message: `Unsupported question type: ${question.questionType.name}`,
          });
      }

      // Cập nhật điểm số tổng
      if (isCorrect) {
        correctAnswer++;
        score++;
      } else {
        wrongAnswer++;
      }

      questionDetails.push(detail);
    }

    // Lưu kết quả vào CSDL theo schema Result đã cập nhật
    const result = new Result({
      examId,
      userId,
      score,
      correctAnswer,
      wrongAnswer,
      questions: questionDetails,
    });

    await result.save();

    // Phản hồi kết quả cho client
    res.status(200).json({
      code: 200,
      message: "Exam submitted successfully!",
      examId,
      userId,
      score,
      correctAnswer,
      wrongAnswer,
      details: questionDetails,
    });
  } catch (error) {
    console.error("Error processing exam:", error);
    res.status(500).json({
      message: "Error submitting exam.",
      error: error.message,
    });
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
      message: "Failed to soft-delete result",
      error,
    });
  }
};

// [GET]: /result/wrong-questions/:resultId
export const getWrongQuestions = async (req, res) => {
  const { resultId } = req.params;

  try {
    // Tìm kết quả bài kiểm tra
    const result = await Result.findById(resultId).populate(
      "questions.questionId"
    );

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
      error,
    });
  }
};
