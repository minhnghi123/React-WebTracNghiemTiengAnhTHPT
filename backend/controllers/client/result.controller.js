import Result from "../../models/Result.model.js";
import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import { trainModel, predict } from "../../utils/ai.util.js";
import { getYoutubeVideos } from "../../utils/youtube.util.js";
import { gemini } from "../../utils/gemini.util.js";

// [GET]: /result/
// Lấy tất cả kết quả (không bị xóa và đã hoàn thành) và populate các trường liên quan
export const getAllResults = async (req, res) => {
  try {
    const filter = { isDeleted: false, isCompleted: true };
    const results = await Result.find(filter).populate({
      path: "examId",
      populate: [
        { path: "questions" },
        { path: "listeningQuestions" }, // Populate listeningQuestions
      ],
    });
    res.status(200).json({
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error });
  }
};

// [POST]: /result/submit
// Xử lý nộp bài thi: kiểm tra thời gian, tính điểm, cập nhật kết quả và trả về phản hồi
export const submitExam = async (req, res) => {
  try {
    const { examId, userId, answers, listeningAnswers } = req.body;

    // Tìm bài kiểm tra và populate các câu hỏi và listeningQuestions
    const exam = await Exam.findOne({ _id: examId })
      .populate({
        path: "questions",
        populate: {
          path: "questionType",
          select: "name",
        },
      })
      .populate("listeningQuestions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Tìm kết quả bài thi đang trong trạng thái chưa hoàn thành
    const existingResult = await Result.findOne({
      examId,
      userId,
      isCompleted: false,
    });

    if (!existingResult) {
      return res.status(400).json({
        code: 400,
        message: "No ongoing exam found for this user.",
      });
    }

    // Nếu thời gian kết thúc đã vượt quá thì vẫn tính điểm dựa trên câu trả lời đã lưu
    if (new Date() > existingResult.endTime) {
      // Tính điểm cho các phần dựa trên dữ liệu đã lưu
      let score = 0;
      let correctAnswer = 0;
      let wrongAnswer = 0;
      if (Array.isArray(existingResult.questions)) {
        existingResult.questions.forEach(q => {
          if (q.isCorrect) {
            score++;
            correctAnswer++;
          } else {
            wrongAnswer++;
          }
        });
      }
      if (Array.isArray(existingResult.listeningQuestions)) {
        existingResult.listeningQuestions.forEach(q => {
          if (q.isCorrect) {
            score++;
            correctAnswer++;
          } else {
            wrongAnswer++;
          }
        });
      }
      existingResult.score = score;
      existingResult.correctAnswer = correctAnswer;
      existingResult.wrongAnswer = wrongAnswer;
      existingResult.isCompleted = true;
      existingResult.endTime = new Date();
      await existingResult.save();
      return res.status(400).json({
        code: 400,
        message: "Exam time has expired. Final score computed.",
        result: existingResult,
      });
    }

    // Khởi tạo các biến tính điểm và lưu chi tiết câu trả lời
    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;
    const questionDetails = [];
    const listeningQuestionDetails = [];
    let wrongAnswerByKnowledge = {};
    let incorrectAnswer = [];
    let answerDetail = "";

    // Xử lý câu trả lời cho các câu hỏi (questions)
    for (const answer of answers) {
      const { questionId, selectedAnswerId, userAnswer } = answer;
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

      switch (question.questionType.name) {
        case "Fill in the Blanks":
          if (Array.isArray(userAnswer)) {
            let correctCount = 0;
            const correctAnswers = question.answers.map(
              (ans) => ans.correctAnswerForBlank
            );
            const userAnswersDetail = userAnswer.map((ua, index) => {
              const correctAns = correctAnswers[index]
                ? correctAnswers[index].trim().toLowerCase()
                : "";
              const userAns = ua ? ua.trim().toLowerCase() : "";
              const answerIsCorrect = correctAns === userAns;
              if (answerIsCorrect) correctCount++;
              return {
                userAnswer: ua,
                answerId: question.answers[index]?._id,
                isCorrect: answerIsCorrect,
              };
            });
            isCorrect = correctCount === question.answers.length;
            detail = {
              questionId: question._id,
              content: question.content,
              answers: question.answers,
              userAnswers: userAnswersDetail,
              correctAnswerForBlank: correctAnswers,
              audio: question.audio || null,
              isCorrect,
            };
          } else if (question.audio) {
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
                message: "Invalid format for userAnswer. It should be an array.",
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

    // Xử lý câu trả lời cho listeningQuestions
    for (const answer of listeningAnswers) {
      const { questionId, selectedAnswerId, userAnswer } = answer;
      const question = exam.listeningQuestions.find(
        (q) => String(q._id) === String(questionId)
      );
      if (!question) {
        return res.status(400).json({
          code: 400,
          message: `Listening Question ${questionId} not found in the exam.`,
        });
      }
      let isCorrect = false;
      let detail = {};
      switch (question.questionType.name) {
        case "Fill in the Blanks":
          if (Array.isArray(userAnswer)) {
            let correctCount = 0;
            const correctAnswers = question.answers.map(
              (ans) => ans.correctAnswerForBlank
            );
            const userAnswersDetail = userAnswer.map((ua, index) => {
              const correctAns = correctAnswers[index]
                ? correctAnswers[index].trim().toLowerCase()
                : "";
              const userAns = ua ? ua.trim().toLowerCase() : "";
              const answerIsCorrect = correctAns === userAns;
              if (answerIsCorrect) correctCount++;
              return {
                userAnswer: ua,
                answerId: question.answers[index]?._id,
                isCorrect: answerIsCorrect,
              };
            });
            isCorrect = correctCount === question.answers.length;
            detail = {
              questionId: question._id,
              content: question.content,
              answers: question.answers,
              userAnswers: userAnswersDetail,
              correctAnswerForBlank: correctAnswers,
              audio: question.audio || null,
              isCorrect,
            };
          } else if (question.audio) {
            const correctAnswers = question.answers
              .map((ans) => ({
                correctAnswer: ans.correctAnswerForBlank,
                answerId: ans._id,
              }))
              .filter((ans) => Boolean(ans.correctAnswer));
            if (!correctAnswers.length) {
              return res.status(500).json({
                message: `Listening Question ${questionId} has no correct answers.`,
              });
            }
            if (!Array.isArray(userAnswer)) {
              return res.status(400).json({
                message: "Invalid format for userAnswer. It should be an array.",
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
              message: `Listening Question ${questionId} has no correct answer.`,
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
      listeningQuestionDetails.push(detail);
    }

    // Lấy gợi ý bài tập cho các kiến thức bị sai
    const suggestionQuestion = await Question.find({
      knowledge: { $in: Object.keys(wrongAnswerByKnowledge) },
    }).select("_id content");

    // Cập nhật kết quả vào CSDL
    existingResult.score = score;
    existingResult.correctAnswer = correctAnswer;
    existingResult.wrongAnswer = wrongAnswer;
    existingResult.questions = questionDetails;
    existingResult.listeningQuestions = listeningQuestionDetails;
    existingResult.suggestionQuestion = suggestionQuestion;
    existingResult.wrongAnswerByKnowledge = wrongAnswerByKnowledge;
    existingResult.answerDetail = answerDetail;
    existingResult.isCompleted = true; // Đánh dấu hoàn thành
    existingResult.endTime = new Date(); // Cập nhật thời gian kết thúc

    await existingResult.save();

    // Lấy video từ Youtube dựa trên kiến thức bị sai
    let videos = {};
    for (const key in wrongAnswerByKnowledge) {
      const video = await getYoutubeVideos(key);
      videos[key] = video;
    }

    // Tạo prompt cho Gemini (ví dụ gửi đến AI để nhận phản hồi)
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
        "Học sinh đã làm sai câu này, bạn hãy đưa ra lời khuyên, tư vấn lộ trình học để đạt kết quả cao hơn ở chủ đề này";
      arrResponse.push(prompt);
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
      listeningQuestions: listeningQuestionDetails,
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
    const result = await Result.findById(resultId)
      .populate({
        path: "questions.questionId",
        populate: [{ path: "listeningQuestions" }],
      })
      .populate({
        path: "listeningQuestions.questionId",
        populate: [{ path: "listeningQuestions" }],
      });
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    const wrongQuestions = result.questions.filter((q) => !q.isCorrect);
    const wrongListeningQuestions = result.listeningQuestions.filter((q) => !q.isCorrect);
    res.status(200).json({
      code: 200,
      message: "Wrong questions fetched successfully.",
      wrongQuestions,
      wrongListeningQuestions,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Failed to fetch wrong questions",
      error,
    });
  }
};

// [GET]: /result/dont-completed
// Kiểm tra các bài thi chưa hoàn thành và đã vượt thời gian, tính điểm cuối cùng dựa trên dữ liệu hiện có, đánh dấu là hoàn thành
export const getDontCompletedExam = async (req, res) => {
  try {
    const now = new Date();
    // Tìm tất cả các kết quả chưa hoàn thành mà đã vượt thời gian
    const results = await Result.find({ isCompleted: false, endTime: { $lt: now } });
    if (!results || results.length === 0) {
      return res.status(200).json({
        code: 200,
        message: "No incomplete exams found that exceeded the time limit",
      });
    }

    const updatedResults = [];
    for (const result of results) {
      let score = 0;
      let correctAnswer = 0;
      let wrongAnswer = 0;
      
      // Tính điểm từ các câu hỏi
      if (Array.isArray(result.questions)) {
        result.questions.forEach((q) => {
          if (q.isCorrect === true) {
            score++;
            correctAnswer++;
          } else {
            wrongAnswer++;
          }
        });
      }
      // Tính điểm từ các listeningQuestions
      if (Array.isArray(result.listeningQuestions)) {
        result.listeningQuestions.forEach((q) => {
          if (q.isCorrect === true) {
            score++;
            correctAnswer++;
          } else {
            wrongAnswer++;
          }
        });
      }
      
      result.score = score;
      result.correctAnswer = correctAnswer;
      result.wrongAnswer = wrongAnswer;
      result.isCompleted = true;
      result.endTime = now;
      
      const savedResult = await result.save();
      updatedResults.push(savedResult);
    }

    res.status(200).json({
      code: 200,
      message: "Final scores computed and incomplete exams updated successfully",
      results: updatedResults,
    });
  } catch (error) {
    console.error("Error checking incomplete exams:", error);
    res.status(500).json({
      code: 500,
      message: "Failed to check and update incomplete exams",
      error: error.message,
    });
  }
};

// [PATCH]: /result/save
// Lưu tiến độ bài thi (chưa hoàn thành)
export const savedExam = async (req, res) => {
  try {
    const { examId, userId, answers, listeningAnswers } = req.body;
    const exam = await Exam.findOne({ _id: examId })
      .populate({
        path: "questions",
        populate: {
          path: "questionType",
          select: "name",
        },
      })
      .populate("listeningQuestions");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }
    const existingResult = await Result.findOne({
      examId,
      userId,
      isCompleted: false,
    });
    if (!existingResult) {
      return res.status(400).json({
        code: 400,
        message: "No ongoing exam found for this user.",
      });
    }
    if (new Date() > existingResult.endTime) {
      existingResult.isCompleted = true;
      await existingResult.save();
      return res.status(400).json({
        code: 400,
        message: "Exam time has expired.",
      });
    }
    // Cập nhật câu trả lời hiện tại
    existingResult.questions = answers;
    existingResult.listeningQuestions = listeningAnswers;
    await existingResult.save();
    res.status(200).json({
      code: 200,
      message: "Exam progress saved successfully!",
      result: existingResult,
    });
  } catch (error) {
    console.error("Error saving exam progress:", error);
    res.status(500).json({
      message: "Error saving exam progress.",
      error: error.message,
    });
  }
};
