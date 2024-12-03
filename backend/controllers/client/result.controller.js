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

    // Tìm bài kiểm tra và danh sách câu hỏi liên quan
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

    // Duyệt qua từng câu trả lời
    for (const answer of answers) {
      const { questionId, selectedAnswerId, userAnswer } = answer;

      // Tìm câu hỏi tương ứng trong bài kiểm tra
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

      // Kiểm tra loại câu hỏi
      switch (question.questionType.name) {
        case "Fill in the Blanks":
          if (question.correctAnswerForBlank) {
            // Câu hỏi điền khuyết thông thường
            isCorrect =
              userAnswer &&
              userAnswer.trim().toLowerCase() ===
                question.correctAnswerForBlank.trim().toLowerCase();

            detail = {
              questionId: question._id,
              content: question.content,
              answers: [],
              userAnswers: [{ userAnswer }],
              correctAnswerForBlank: [question.correctAnswerForBlank],
              audio: question.audio || null,
              isCorrect,
            };
          } else if (question.audio) {
            // Câu hỏi nghe điền khuyết
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

            const userAnswersDetail = userAnswer.map((answer) => {
              const matchedAnswer = correctAnswers.find(
                (correct) =>
                  answer.trim().toLowerCase() ===
                  correct.correctAnswer.trim().toLowerCase()
              );
              return {
                userAnswer: answer,
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

      // Cập nhật điểm số và chi tiết câu hỏi
      if (isCorrect) {
        correctAnswer++;
        score++;
      } else {
        wrongAnswer++;
      }

      questionDetails.push(detail);
    }

    // Lưu kết quả vào cơ sở dữ liệu
    const result = new Result({
      examId,
      userId,
      score,
      correctAnswer,
      wrongAnswer,
      questions: questionDetails,
    });

    await result.save();

    // Phản hồi kết quả
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
