import Result from "../../models/Result.model.js";
import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import { trainModel, predict } from "../../utils/ai.util.js";
import { getYoutubeVideos } from "../../utils/youtube.util.js";
import { gemini } from "../../utils/gemini.util.js";
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
    let wrongAnswerByKnowledge = {};
    let incorrectAnswer = [];
    let answerDetail = "";
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
                  ua.trim().toLowerCase() ===
                  correct.correctAnswer.trim().toLowerCase()
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
          const correctAnswerObj = question.answers.find(
            (ans) => ans.isCorrect
          );
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
        let questionContent = question?.content;
        let answerTmp = question?.answers;

        for (const ans of answerTmp) {
          if (!ans.text) {
            answerDetail += ans.correctAnswerForBlank;
          } else {
            answerDetail += ans.text;
          }
          answerDetail += "\n";
        }
        const knowledge = question?.knowledge;
        if (!wrongAnswerByKnowledge[knowledge]) {
          wrongAnswerByKnowledge[knowledge] = 0;
        }
        wrongAnswerByKnowledge[knowledge]++;
        incorrectAnswer.push({
          questionContent,
          answerDetail,
          knowledge,
        });
      }

      questionDetails.push(detail);
    }

    // Goi y bai tap ve cau hoi bi lam sai
    const suggestionQuestion = await Question.find({
      knowledge: { $in: Object.keys(wrongAnswerByKnowledge) },
    }).select("_id content");
    // Lưu kết quả vào CSDL theo schema Result đã cập nhật
    const result = new Result({
      examId,
      userId,
      score,
      correctAnswer,
      wrongAnswer,
      questions: questionDetails,
      suggestionQuestion,
      wrongAnswerByKnowledge,
      answerDetail,
    });

    await result.save();
    // Tim kiem video tren youtube
    let videos = {};
    for (const key in wrongAnswerByKnowledge) {
      const video = await getYoutubeVideos(key);
      videos[key] = video;
    }
    // Phản hồi kết quả cho client
    // tao prompt de send to gemini ;
    let prompt = "";
    let arrResponse = [];
    for (const q of incorrectAnswer) {
      let ex = "Đây là câu hỏi tiếng anh, ";
      prompt += ex;
      prompt += q.content + "\n";
      prompt += q.answerDetail;
      let know = "Thuộc loại kiến thức :";
      prompt += know + "\n";
      prompt += q.knowledge + "\n";
      prompt +=
        "Học sinh đã làm sai cầu này, bạn hãy đưa ra lời khuyên, tư vấn lộ trình học để đạt kết quả cao hơn ở câu hỏi chủ đề này";
      const response = await gemini(prompt);
      arrResponse.push(response);
      // console.log(response);
    }
    res.status(200).json({
      code: 200,
      message: "Exam submitted successfully!",
      examId,
      userId,
      score,
      correctAnswer,
      wrongAnswer,
      details: questionDetails,
      wrongAnswerByKnowledge,
      suggestionQuestion,
      videos,
      arrResponse,
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
