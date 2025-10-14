import mongoose from "mongoose";
import Result from "../../models/Result.model.js";
import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import { trainModel, predict } from "../../utils/ai.util.js";
import { getYoutubeVideos } from "../../utils/youtube.util.js";
import { gemini } from "../../utils/gemini.util.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
import { Audio } from "../../models/Audio.model.js";
import ListeningExam from "../../models/listeningExam.model.js";
import { TaiKhoan } from "../../models/Taikhoan.model.js";
import { userLog } from "../../utils/logUser.js";

// [GET]: /result/
// Lấy tất cả kết quả (không bị xóa và đã hoàn thành) và populate các trường liên quan
export const getAllResults = async (req, res) => {
  try {
    const filter = {
      userId: req.user._id, // Lọc theo userId từ token
      isDeleted: false,
      isCompleted: true,
    };
    // console.log(filter);
    const results = await Result.find(filter).populate({
      path: "examId",
      populate: [
        { path: "questions" },
        {
          path: "listeningExams",
          populate: {
            path: "questions",
            select: "questionText options correctAnswer blankAnswer audio", // Include necessary fields
          },
        },
      ],
    });
    userLog(req, "View All Results", "User fetched all completed results.");
    res.status(200).json({
      code: 200,
      data: results,
    });
  } catch (error) {
    userLog(req, "View All Results", `Error fetching results: ${error.message}`);
    res.status(500).json({ message: "Failed to fetch results", error });
  }
};

// [GET]: /result/listening
// Lấy tất cả kết quả ListeningExam (không bị xóa và đã hoàn thành)
export const getAllListeningResults = async (req, res) => {
  try {
    const filter = {
      userId: req.user._id,
      isDeleted: false,
      isCompleted: true,
    };
    const results = await Result.find(filter).populate({
      path: "examId",
      model: "ListeningExam",
      populate: {
        path: "questions",
        select: "questionText options correctAnswer audio",
      },
    });

    userLog(req, "View All Listening Results", "User fetched all completed listening results.");
    res.status(200).json({
      code: 200,
      data: results,
    });
  } catch (error) {
    userLog(req, "View All Listening Results", `Error fetching listening results: ${error.message}`);
    res.status(500).json({ message: "Failed to fetch listening results", error });
  }
};

// [POST]: /result/submit
// Xử lý nộp bài thi: kiểm tra thời gian, tính điểm, cập nhật kết quả và trả về phản hồi
// Map database type names to switch-case labels
const questionTypeMapping = {
  "Multiple Choices":      "Multiple Choices",
  "Fill in the blank":     "Fill in the Blanks",
  "True/False/Not Given":  "True/False/Not Given",
};

export const submitExam = async (req, res) => {
  try {
    const { resultId, answers = [], listeningAnswers = [], unansweredQuestions = [] } = req.body;
    if (!resultId || !Array.isArray(answers) || !Array.isArray(listeningAnswers)) {
      return res.status(400).json({ message: "Invalid input data." });
    }

    const existingResult = await Result.findOne({ _id: resultId, isCompleted: false })
      .populate({
        path: "examId",
        populate: [
          { path: "questions", populate: { path: "questionType", select: "name" } },
          { path: "listeningExams", populate: { path: "questions", populate: { path: "questionType", select: "name" } } }
        ]
      });

    if (!existingResult) {
      return res.status(400).json({ code: 400, message: "No ongoing exam found for this user." });
    }
    const exam = existingResult.examId;
    if (!exam) {
      return res.status(400).json({ code: 400, message: "Exam not found." });
    }

    // If time expired, finalize existing answers
    if (new Date() > existingResult.endTime) {
      let score = 0, correctAnswer = 0, wrongAnswer = 0;
      existingResult.questions?.forEach(q => q.isCorrect ? (score++, correctAnswer++) : wrongAnswer++);
      existingResult.listeningQuestions?.forEach(q => q.isCorrect ? (score++, correctAnswer++) : wrongAnswer++);
      Object.assign(existingResult, { score, correctAnswer, wrongAnswer, isCompleted: true, endTime: new Date() });
      await existingResult.save();
      return res.status(400).json({ code: 400, message: "Exam time has expired. Final score computed.", result: existingResult });
    }

    let score = 0, correctAnswer = 0, wrongAnswer = 0;
    let unAnswerQ = unansweredQuestions.length;
    const questionDetails = []; // CHỈ chứa câu đã trả lời
    const listeningQuestionDetails = []; // CHỈ chứa câu đã trả lời
    const wrongAnswerByKnowledge = {};
    const incorrectAnswer = [];
    let answerDetail = "";

    // KHÔNG xử lý unansweredQuestions ở đây nữa - chỉ đếm số lượng
    for (const qId of unansweredQuestions) {
      const question = exam.questions.find(q => String(q._id) === String(qId))
        || exam.listeningExams.flatMap(le => le.questions).find(q => String(q._id) === String(qId));
      if (question) {
        wrongAnswer++;
        const know = question.knowledge;
        wrongAnswerByKnowledge[know] = (wrongAnswerByKnowledge[know] || 0) + 1;
        incorrectAnswer.push({
          questionContent: question.content || question.questionText,
          answerDetail: (question.answers || question.options).map(a => a.text || a.correctAnswerForBlank || a.optionText).join("\n"),
          knowledge: know
        });
      }
    }

    // Process standard answers - CHỈ lưu câu đã trả lời
    for (const ans of answers) {
      const { questionId, selectedAnswerId, userAnswer } = ans;
      const question = exam.questions.find(q => String(q._id) === String(questionId))
        || exam.listeningExams.flatMap(le => le.questions).find(q => String(q._id) === String(questionId));
      if (!question) continue;

      const typeName = questionTypeMapping[question.questionType.name] || question.questionType.name;
      let isCorrect = false;
      let detail = {};

      switch (typeName) {
        case "Fill in the Blanks": {
          const blanks = question.answers.map(a => a.correctAnswerForBlank.trim().toLowerCase());
          const userDetails = (userAnswer || []).map((ua, i) => {
            const ansClean = ua?.trim().toLowerCase() || "";
            const correct = blanks[i] || "";
            const ok = ansClean === correct;
            return { userAnswer: ua, answerId: question.answers[i]?._id, isCorrect: ok };
          });
          isCorrect = userDetails.length === blanks.length && userDetails.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.content || "", answers: question.answers, userAnswers: userDetails, correctAnswerForBlank: blanks, audio: question.audio, isCorrect };
          break;
        }
        case "Multiple Choices": {
          const correctObj = question.answers.find(a => a.isCorrect);
          if (!correctObj) return res.status(500).json({ message: `Question ${questionId} has no correct answer.` });
          isCorrect = String(correctObj._id) === String(selectedAnswerId);
          detail = { questionId: question._id, content: question.content || "", answers: question.answers, selectedAnswerId, userAnswers: [{ userAnswer: selectedAnswerId }], correctAnswerForBlank: null, audio: question.audio, isCorrect };
          break;
        }
        case "True/False/Not Given": {
          const correctTF = question.correctAnswerForTrueFalseNGV || [];
          const userTF = (userAnswer || []).map(ua => ({ userAnswer: ua, isCorrect: correctTF.includes(ua.trim().toLowerCase()) }));
          isCorrect = userTF.length === correctTF.length && userTF.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.content || "", answers: [], userAnswers: userTF, correctAnswerForBlank: correctTF, audio: question.audio, isCorrect };
          break;
        }
        default:
          continue;
      }

      if (isCorrect) { 
        correctAnswer++; 
        score++; 
      } else {
        wrongAnswer++;
        const know = question.knowledge;
        wrongAnswerByKnowledge[know] = (wrongAnswerByKnowledge[know] || 0) + 1;
        answerDetail += (question.answers || []).map(a => a.text || a.correctAnswerForBlank).join("\n") + "\n";
        incorrectAnswer.push({ questionContent: question.content, answerDetail, knowledge: know });
      }
      questionDetails.push(detail); // CHỈ push câu đã trả lời
    }

    // Process listening answers - CHỈ lưu câu đã trả lời
    for (const ans of listeningAnswers) {
      const { questionId, selectedAnswerId, userAnswer } = ans;
      const question = exam.listeningExams.flatMap(le => le.questions).find(q => String(q._id) === String(questionId));
      if (!question) continue;

      const typeName = questionTypeMapping[question.questionType.name] || question.questionType.name;
      let isCorrect = false;
      let detail = {};

      switch (typeName) {
        case "Fill in the Blanks": {
          const blanks = question.blankAnswer.split(",").map(a => a.trim().toLowerCase());
          const userDetails = (userAnswer || []).map((ua, i) => ({ userAnswer: ua, answerId: null, isCorrect: ua.trim().toLowerCase() === blanks[i] }));
          isCorrect = userDetails.length === blanks.length && userDetails.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.questionText || "", answers: question.options || [], userAnswers: userDetails, correctAnswerForBlank: blanks, audio: question.audio, isCorrect };
          break;
        }
        case "Multiple Choices": {
          const correctObj = question.correctAnswer[0];
          if (!correctObj) return res.status(500).json({ message: `Listening Question ${questionId} has no correct answer.` });
          const transformed = (question.options || []).map(opt => ({ ...opt.toObject(), isCorrect: String(opt.option_id) === String(correctObj.answer_id) }));
          isCorrect = String(correctObj.answer_id) === String(selectedAnswerId);
          detail = { questionId: question._id, content: question.questionText || "", answers: transformed, selectedAnswerId, userAnswers: [{ userAnswer: selectedAnswerId }], correctAnswerForBlank: null, audio: question.audio, isCorrect };
          break;
        }
        case "True/False/Not Given": {
          const correctTF = question.correctAnswerForTrueFalseNGV || [];
          const userTF = (userAnswer || []).map(ua => ({ userAnswer: ua, isCorrect: correctTF.includes(ua.trim().toLowerCase()) }));
          isCorrect = userTF.length === correctTF.length && userTF.every(d => d.isCorrect);
          detail = { questionId: question._id, content: question.questionText || "", answers: [], userAnswers: userTF, correctAnswerForBlank: correctTF, audio: question.audio, isCorrect };
          break;
        }
        default:
          continue;
      }

      if (isCorrect) { 
        correctAnswer++; 
        score++; 
      } else {
        wrongAnswer++;
        const know = question.knowledge;
        wrongAnswerByKnowledge[know] = (wrongAnswerByKnowledge[know] || 0) + 1;
        answerDetail += (question.options || []).map(a => a.optionText || a.correctAnswerForBlank).join("\n") + "\n";
        incorrectAnswer.push({ questionContent: question.questionText, answerDetail, knowledge: know });
      }
      listeningQuestionDetails.push(detail); // CHỈ push câu đã trả lời
    }

    const suggestionQuestion = await Question.find({ knowledge: { $in: Object.keys(wrongAnswerByKnowledge) } }).select("_id content");
    const totalQuestions = (exam.questions?.length || 0) + exam.listeningExams.reduce((a, le) => a + (le.questions?.length || 0), 0);
    const finalScore = Math.round((correctAnswer / totalQuestions * 10) * 100) / 100;

    Object.assign(existingResult, {
      score: finalScore,
      correctAnswer,
      wrongAnswer,
      questions: questionDetails, // CHỈ chứa câu đã trả lời
      listeningQuestions: listeningQuestionDetails, // CHỈ chứa câu đã trả lời
      suggestionQuestion,
      wrongAnswerByKnowledge,
      answerDetail,
      isCompleted: true,
      endTime: new Date()
    });
    await existingResult.save();

    const videos = {};
    for (const key of Object.keys(wrongAnswerByKnowledge)) {
      try {
        videos[key] = await getYoutubeVideos(key);
      } catch (error) {
        console.error(`Error fetching YouTube videos for knowledge: ${key}`, error.message);
        videos[key] = [];
      }
    }

    let prompt2 = incorrectAnswer.map(q => `Đây là câu hỏi tiếng anh (${q.questionContent}), đáp án: ${q.answerDetail}, kiến thức: ${q.knowledge}.`).join(" ");
    let prompt = "Hãy đưa ra lời khuyên, lộ trình học tiếng Anh biết học sinh đẫ làm các câu trả lời sai sau đây: " + prompt2;
    
    userLog(req, "Submit Exam", `User submitted exam with result ID: ${req.body.resultId}`);
    return res.status(200).json({
      code: 200,
      message: "Exam submitted successfully!",
      examId: exam._id,
      userId: existingResult.userId,
      score: finalScore,
      correctAnswer,
      wrongAnswer,
      unAnswerQ,
      totalQuestion: totalQuestions,
      details: questionDetails, // CHỈ câu đã trả lời
      listeningQuestions: listeningQuestionDetails, // CHỈ câu đã trả lời
      wrongAnswerByKnowledge,
      suggestionQuestion,
      videos,
      arrResponse: prompt
    });
  } catch (error) {
    userLog(req, "Submit Exam", `Error submitting exam: ${error.message}`);
    console.error("Error processing exam:", error);
    return res.status(500).json({ message: "Error submitting exam.", error: error.message });
  }
};

// [POST]: /result/listening/submit
// Xử lý nộp bài thi ListeningExam
export const submitListeningExam = async (req, res) => {
  try {
    const { resultId, answers } = req.body;

    if (!resultId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid input data." });
    }

    const existingResult = await Result.findOne({
      _id: resultId,
      isCompleted: false,
    }).populate({
      path: "examId",
      model: "ListeningExam",
      populate: {
        path: "questions",
        select: "questionText options correctAnswer blankAnswer",
      },
    });

    if (!existingResult) {
      return res.status(400).json({
        code: 400,
        message: "No ongoing listening exam found for this user.",
      });
    }

    const listeningExam = existingResult.examId;
    if (!listeningExam) {
      return res.status(400).json({ code: 400, message: "Listening exam not found." });
    }

    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;
    const questionDetails = [];

    for (const answer of answers) {
      const { questionId, selectedAnswerId, userAnswer } = answer;
      const question = listeningExam.questions.find(
        (q) => String(q._id) === String(questionId)
      );

      if (!question) {
        return res.status(400).json({
          code: 400,
          message: `Question ${questionId} not found in the listening exam.`,
        });
      }

      let isCorrect = false;
      let detail = {};

      if (question.correctAnswer && question.correctAnswer.length > 0) {
        const correctAnswerObj = question.correctAnswer[0];
        isCorrect =
          String(correctAnswerObj.answer_id) === String(selectedAnswerId);

        detail = {
          questionId: question._id,
          content: question.questionText,
          answers: question.options,
          selectedAnswerId,
          isCorrect,
        };
      } else if (question.blankAnswer) {
        const correctAnswers = question.blankAnswer
          .split(",")
          .map((ans) => ans.trim().toLowerCase());
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer.map((ua) => ua.trim().toLowerCase())
          : [];
        const correctCount = userAnswers.filter((ua) =>
          correctAnswers.includes(ua)
        ).length;

        isCorrect = correctCount === correctAnswers.length;

        detail = {
          questionId: question._id,
          content: question.questionText,
          userAnswers,
          correctAnswers,
          isCorrect,
        };
      }

      if (isCorrect) {
        score++;
        correctAnswer++;
      } else {
        wrongAnswer++;
      }

      questionDetails.push(detail);
    }

    const totalQuestions = listeningExam.questions.length;
    const finalScore = (correctAnswer / totalQuestions) * 10;
    const roundedScore = Math.round(finalScore * 100) / 100;

    existingResult.score = roundedScore;
    existingResult.correctAnswer = correctAnswer;
    existingResult.wrongAnswer = wrongAnswer;
    existingResult.questions = questionDetails;
    existingResult.isCompleted = true;
    existingResult.endTime = new Date();

    await existingResult.save();

    userLog(req, "Submit Listening Exam", `User submitted listening exam with result ID: ${req.body.resultId}`);
    res.status(200).json({
      code: 200,
      message: "Listening exam submitted successfully!",
      score: roundedScore,
      correctAnswer,
      wrongAnswer,
      totalQuestions,
      details: questionDetails,
    });
  } catch (error) {
    userLog(req, "Submit Listening Exam", `Error submitting listening exam: ${error.message}`);
    res.status(500).json({
      message: "Error submitting listening exam.",
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
    userLog(req, "Delete Result", `User soft-deleted result with ID: ${id}`);
    res.status(200).json({
      code: 200,
      message: "Result soft-deleted successfully",
      result,
    });
  } catch (error) {
    userLog(req, "Delete Result", `Error soft-deleting result: ${error.message}`);
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
    const wrongListeningQuestions = result.listeningQuestions.filter(
      (q) => !q.isCorrect
    );
    userLog(req, "View Wrong Questions", `User fetched wrong questions for result ID: ${resultId}`);
    res.status(200).json({
      code: 200,
      message: "Wrong questions fetched successfully.",
      wrongQuestions,
      wrongListeningQuestions,
    });
  } catch (error) {
    userLog(req, "View Wrong Questions", `Error fetching wrong questions: ${error.message}`);
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
    const expiredResults = await Result.find({
      isCompleted: false,
      endTime: { $lt: now },
    }).populate({
      path: "examId",
      populate: [
        {
          path: "questions",
          populate: { path: "questionType", select: "name" },
        },
        { path: "listeningExams", populate: { path: "questions", populate: { path: "questionType", select: "name" } } },
      ],
    });

    if (expiredResults && expiredResults.length > 0) {
      for (const result of expiredResults) {
        try {
          const exam = result.examId;
          if (!exam) {
            result.isDeleted = true;
            result.isCompleted = true;
            await result.save();
            continue;
          }

          let score = 0, correctAnswer = 0, wrongAnswer = 0;
          const questionDetails = [];
          const listeningQuestionDetails = [];
          const wrongAnswerByKnowledge = {};

          // Process regular questions
          for (const question of exam.questions || []) {
            const userAnswer = result.questions.find(
              (q) => String(q.questionId) === String(question._id)
            );
            const isCorrect = userAnswer?.isCorrect || false;

            if (isCorrect) {
              score++;
              correctAnswer++;
            } else {
              wrongAnswer++;
              const knowledge = question.knowledge;
              wrongAnswerByKnowledge[knowledge] = (wrongAnswerByKnowledge[knowledge] || 0) + 1;
            }

            questionDetails.push({
              questionId: question._id,
              content: question.content || " ",
              answers: question.answers,
              userAnswers: userAnswer?.userAnswers || [],
              correctAnswerForBlank: question.answers?.map((ans) => ans.correctAnswerForBlank) || [],
              audio: question.audio || null,
              isCorrect,
            });
          }

          // Process listening questions
          for (const listeningExam of exam.listeningExams || []) {
            for (const question of listeningExam.questions || []) {
              const userAnswer = result.listeningQuestions.find(
                (q) => String(q.questionId) === String(question._id)
              );
              const isCorrect = userAnswer?.isCorrect || false;

              if (isCorrect) {
                score++;
                correctAnswer++;
              } else {
                wrongAnswer++;
                const knowledge = question.knowledge;
                wrongAnswerByKnowledge[knowledge] = (wrongAnswerByKnowledge[knowledge] || 0) + 1;
              }

              listeningQuestionDetails.push({
                questionId: question._id,
                content: question.questionText || " ",
                answers: question.options || [],
                userAnswers: userAnswer?.userAnswers || [],
                correctAnswerForBlank: question.blankAnswer
                  ? question.blankAnswer.split(",").map((ans) => ans.trim())
                  : [],
                audio: question.audio || null,
                isCorrect,
              });
            }
          }

          const totalQuestions =
            (exam.questions?.length || 0) +
            exam.listeningExams.reduce((acc, le) => acc + (le.questions?.length || 0), 0);
          const finalScore = Math.round((correctAnswer / totalQuestions * 10) * 100) / 100;

          Object.assign(result, {
            score: finalScore,
            correctAnswer,
            wrongAnswer,
            questions: questionDetails,
            listeningQuestions: listeningQuestionDetails,
            wrongAnswerByKnowledge,
            isCompleted: true,
            endTime: now,
          });

          await result.save();
        } catch (error) {
          console.error(`Error processing result ${result._id}:`, error.message);
          continue;
        }
      }
    }

    const token = req.cookies["jwt-token"];
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const ongoingExam = await Result.findOne({
      userId: decoded.userId,
      isCompleted: false,
      endTime: { $gt: now },
    }).populate({
      path: "examId",
      populate: [
        {
          path: "questions",
          populate: { path: "passageId", select: "title content createdAt updatedAt" },
        },
        { path: "listeningExams", populate: { path: "questions audio" } },
      ],
    });
    // Return only existing ongoing exams without creating new ones
    userLog(req, "Check Incomplete Exams", "User checked incomplete exams and updated final scores.");
    res.status(200).json({
      code: 200,
      message: "Final scores computed and incomplete exams updated successfully",
      results: ongoingExam || null,
    });
  } catch (error) {
    userLog(req, "Check Incomplete Exams", `Error checking incomplete exams: ${error.message}`);
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
    userLog(req, "Save Exam Progress", `User saved progress for exam ID: ${req.body.examId}`);
    res.status(200).json({
      code: 200,
      message: "Exam progress saved successfully!",
      result: existingResult,
    });
  } catch (error) {
    userLog(req, "Save Exam Progress", `Error saving exam progress: ${error.message}`);
    console.error("Error saving exam progress:", error);
    res.status(500).json({
      message: "Error saving exam progress.",
      error: error.message,
    });
  }
};

// [POST]: /result/save-single-answer
// Lưu câu trả lời đơn lẻ
export const saveSingleAnswer = async (req, res) => {
  try {
    const { resultId, questionId, selectedAnswerId, userAnswer, isListening } = req.body;

    if (!resultId || !questionId) {
      return res.status(400).json({ message: "Invalid input data." });
    }

    const existingResult = await Result.findOne({
      _id: resultId,
      isCompleted: false,
    }).populate({
      path: "examId",
      populate: [
        { path: "questions", populate: { path: "questionType", select: "name" } },
        {
          path: "listeningExams",
          populate: {
            path: "questions",
            populate: { path: "questionType", select: "name" },
          },
        },
      ],
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

    const exam = existingResult.examId;
    if (!exam) {
      return res.status(400).json({ code: 400, message: "Exam not found." });
    }

    let question, isCorrect = false, detail = {};

    if (isListening) {
      question = exam.listeningExams
        .flatMap((le) => le.questions || []) // Ensure questions array exists
        .find((q) => String(q._id) === String(questionId));
    } else {
      question = exam.questions.find((q) => String(q._id) === String(questionId));
    }

    if (!question) {
      return res.status(400).json({
        code: 400,
        message: `Question ${questionId} not found in the exam.`,
      });
    }

    const typeName = questionTypeMapping[question.questionType.name] || question.questionType.name;

    switch (typeName) {
      case "Fill in the Blanks": {
        const blanks = question.answers.map(a => a.correctAnswerForBlank.trim().toLowerCase());
        const userDetails = (userAnswer || []).map((ua, i) => ({
          userAnswer: ua,
          answerId: question.answers[i]?._id,
          isCorrect: ua.trim().toLowerCase() === (blanks[i] || ""),
        }));
        isCorrect = userDetails.length === blanks.length && userDetails.every(d => d.isCorrect);
        detail = {
          questionId: question._id,
          userAnswers: userDetails,
          isCorrect,
        };
        break;
      }
      case "Multiple Choices": {
        const correctObj = question.answers.find(a => a.isCorrect);
        if (!correctObj) {
          return res.status(500).json({ message: `Question ${questionId} has no correct answer.` });
        }
        isCorrect = String(correctObj._id) === String(selectedAnswerId);
        detail = {
          questionId: question._id,
          selectedAnswerId,
          userAnswers: [{ userAnswer: selectedAnswerId }],
          isCorrect,
        };
        break;
      }
      case "True/False/Not Given": {
        const correctTF = question.correctAnswerForTrueFalseNGV || [];
        const userTF = (userAnswer || []).map(ua => ({
          userAnswer: ua,
          isCorrect: correctTF.includes(ua.trim().toLowerCase()),
        }));
        isCorrect = userTF.length === correctTF.length && userTF.every(d => d.isCorrect);
        detail = {
          questionId: question._id,
          userAnswers: userTF,
          isCorrect,
        };
        break;
      }
      default:
        return res.status(400).json({
          message: `Unsupported question type: ${question.questionType.name}`,
        });
    }

    if (isListening) {
      const questionIndex = existingResult.listeningQuestions.findIndex(
        (q) => String(q.questionId) === String(questionId)
      );

      if (questionIndex !== -1) {
        existingResult.listeningQuestions[questionIndex] = detail;
      } else {
        existingResult.listeningQuestions.push(detail);
      }
    } else {
      const questionIndex = existingResult.questions.findIndex(
        (q) => String(q.questionId) === String(questionId)
      );

      if (questionIndex !== -1) {
        existingResult.questions[questionIndex] = detail;
      } else {
        existingResult.questions.push(detail);
      }
    }

    await existingResult.save();

    // userLog(req, "Save Single Answer", `User saved single answer for question ID: ${req.body.questionId}`);
    res.status(200).json({
      code: 200,
      message: "Answer saved successfully!",
      result: existingResult,
    });
  } catch (error) {
    // userLog(req, "Save Single Answer", `Error saving single answer: ${error.message}`);
    console.error("Error saving single answer:", error);
    res.status(500).json({
      message: "Error saving single answer.",
      error: error.message,
    });
  }
};

export const reportViolation = async (req, res) => {
  try {
    const token = req.cookies["jwt-token"];
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const userId = decoded.userId;
     
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await TaiKhoan.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.violationCount += 1;
    if (user.violationCount % 5 === 0) {
      user.violationCount = 0; 
      user.blockedUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // chặn 3 ngày
    }
    await user.save();
    userLog(req, "Report Violation", `User reported a violation. User ID: ${decoded.userId}`);
    res.status(200).json({
      message: "Violation reported successfully.",
      violationCount: user.violationCount,
      blockedUntil: user.blockedUntil,
    });
  } catch (error) {
    userLog(req, "Report Violation", `Error reporting violation: ${error.message}`);
    console.error("Error reporting violation:", error);
    res.status(500).json({ message: "Error reporting violation.", error: error.message });
  }
};
