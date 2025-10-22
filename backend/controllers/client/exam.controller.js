import Exam from "../../models/Exam.model.js";
import { redisService } from "../../config/redis.config.js";
import Result from "../../models/Result.model.js";
import { Passage } from "../../models/Passage.model.js";
import ListeningExam from "../../models/listeningExam.model.js";
import { userLog } from "../../utils/logUser.js";
import { TaiKhoan } from "../../models/Taikhoan.model.js";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const index = async (req, res) => {
  try {
    let currentPage = 1;
    if (req.query.page) {
      currentPage = parseInt(req.query.page);
    }
    let limitItems = 4;
    if (req.query.limit) {
      limitItems = parseInt(req.query.limit);
    }

    // ✅ NEW: Thêm filter type
    const { type } = req.query; // type: 'reading', 'listening', 'both'

    const condition = {
      isPublic: true,
    };

    const totalItems = await Exam.countDocuments(condition);
    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);
    
    const exams = await Exam.find(condition)
      .populate("questions")
      .populate({
        path: "listeningExams",
        populate: [
          { path: "audio" },
          { path: "questions" }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limitItems)
      .skip(skip)
      .lean();

    const enrichedExams = exams.map(exam => {
      const readingQuestions = exam.questions?.length || 0;
      const listeningQuestions = (exam.listeningExams || [])
        .filter(le => le && le.questions)
        .reduce((sum, le) => sum + (le.questions?.length || 0), 0);
      
      const totalQuestions = readingQuestions + listeningQuestions;

      return {
        ...exam,
        totalQuestions,
        hasReading: readingQuestions > 0,
        hasListening: listeningQuestions > 0,
        readingCount: readingQuestions,
        listeningCount: listeningQuestions,
      };
    });

    // ✅ NEW: Apply filter based on type
    let filteredExams = enrichedExams;
    if (type === 'reading') {
      filteredExams = enrichedExams.filter(exam => exam.hasReading && !exam.hasListening);
    } else if (type === 'listening') {
      filteredExams = enrichedExams.filter(exam => exam.hasListening && !exam.hasReading);
    } else if (type === 'both') {
      filteredExams = enrichedExams.filter(exam => exam.hasReading && exam.hasListening);
    }
    // 'all' or undefined: return all
      
    const data = {
      code: 200,
      exams: filteredExams,
      currentPage: currentPage,
      totalItems: filteredExams.length, // ✅ Update total after filter
      totalPage: Math.ceil(filteredExams.length / limitItems),
      limitItems: limitItems,
      hasNextPage: currentPage < Math.ceil(filteredExams.length / limitItems),
    };
    
    userLog(
      req,
      "View Exams",
      `User accessed exams list on page ${currentPage} with limit ${limitItems} and type filter: ${type || 'all'}`
    );
    res.status(200).json(data);
  } catch (error) {
    userLog(req, "View Exams", `Error viewing exams: ${error.message}`);
    res.status(400).json({ code: 400, message: error.message });
  }
};

export const detailExam = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // ✅ FIX: Populate FULL listeningExams (audio + questions)
    const exam = await Exam.findOne({ slug })
      .populate("questions")
      .populate({
        path: "listeningExams",
        populate: [
          { path: "audio" }, // ✅ Thêm populate audio
          { path: "questions" }
        ]
      })
      .lean();
      
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // ✅ Thêm thông tin tổng số câu hỏi
    const readingQuestions = exam.questions?.length || 0;
    
    // ✅ FIX: Đếm listening questions an toàn
    const listeningQuestions = (exam.listeningExams || [])
      .filter(le => le && le.questions) // ✅ Filter null/undefined
      .reduce((sum, le) => sum + (le.questions?.length || 0), 0);

    const enrichedExam = {
      ...exam,
      totalQuestions: readingQuestions + listeningQuestions,
      hasReading: readingQuestions > 0,
      hasListening: listeningQuestions > 0,
      readingCount: readingQuestions,
      listeningCount: listeningQuestions,
    };

    console.log(`📊 Exam detail "${exam.title}":`, {
      reading: readingQuestions,
      listening: listeningQuestions,
      total: readingQuestions + listeningQuestions,
    });
    
    userLog(
      req,
      "View Exam Detail",
      `User viewed exam detail for slug: ${slug}`
    );
    res.status(200).json({ code: 200, exam: enrichedExam });
  } catch (error) {
    userLog(
      req,
      "View Exam Detail",
      `Error viewing exam detail: ${error.message}`
    );
    res.status(400).json({ code: 400, message: error.message });
  }
};

export const joinedExam = async (req, res) => {
  try {
    console.log("📌 joinedExam called with examId:", req.params.examId);
    
    // ✅ Kiểm tra user
    const userAccount = await TaiKhoan.findById(req.user._id);
    if (!userAccount) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    if (userAccount.blockedUntil && new Date() < userAccount.blockedUntil) {
      return res.status(403).json({
        code: 403,
        message: `Tài khoản của bạn bị chặn đến ${userAccount.blockedUntil.toLocaleString()}.`,
      });
    }

    // ✅ TỰ ĐỘNG XÓA/HOÀN THÀNH tất cả bài thi cũ chưa hoàn thành
    const now = new Date();
    const oldResults = await Result.find({
      userId: req.user._id,
      isCompleted: false,
    });

    console.log(`📌 Found ${oldResults.length} incomplete results for user ${req.user._id}`);

    if (oldResults && oldResults.length > 0) {
      for (const oldResult of oldResults) {
        oldResult.isCompleted = true;
        oldResult.score = 0;
        await oldResult.save();
        console.log(`✅ Force completed result: ${oldResult._id}`);
      }
    }

    // ✅ Kiểm tra examId là slug hay ObjectId
    const { examId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(examId);
    
    const query = isObjectId 
      ? { _id: examId, isPublic: true }
      : { slug: examId, isPublic: true };

    console.log(`🔍 Looking for exam with query:`, query);

    // ✅ FIX: Populate FULL listening exams (audio + questions)
    const exam = await Exam.findOne(query)
      .populate({
        path: "questions",
        populate: { path: "answers" },
      })
      .populate({
        path: "listeningExams",
        populate: [
          { path: "audio" }, // ✅ Thêm populate audio
          {
            path: "questions",
            populate: { path: "options" },
          }
        ],
      });

    if (!exam) {
      return res.status(404).json({ message: "Đề thi không tồn tại." });
    }

    console.log(`✅ Found exam:`, exam._id, exam.title);
    console.log(`📌 Listening exams count:`, exam.listeningExams?.length || 0);

    // Shuffle câu hỏi
    const allShuffled = shuffleArray([...(exam.questions || [])]).map((question) => {
      return {
        ...question.toObject(),
        answers: question.answers ? shuffleArray([...question.answers]) : [],
      };
    });

    const groupedQuestions = {};
    const shuffledQuestions = [];

    for (const question of allShuffled) {
      if (question.passageId) {
        if (!groupedQuestions[question.passageId]) {
          groupedQuestions[question.passageId] = [];
        }
        groupedQuestions[question.passageId].push(question);
      } else {
        shuffledQuestions.push(question);
      }
    }

    const passageIds = Object.keys(groupedQuestions);
    const passages = await Promise.all(
      passageIds.map((id) => Passage.findById(id))
    );

    const readingQuestionsArray = passageIds.map((id) => {
      return {
        passageInfo: passages.find((p) => p._id.toString() === id),
        questions: groupedQuestions[id],
      };
    });

    const shuffledListeningExams = (exam.listeningExams || []).map((listeningExam) => {
      return {
        ...listeningExam.toObject(),
        questions: shuffleArray([...(listeningExam.questions || [])]).map(
          (listeningQuestion) => ({
            ...listeningQuestion.toObject(),
            options: listeningQuestion.options ? shuffleArray([...listeningQuestion.options]) : [],
          })
        ),
      };
    });

    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + exam.duration);

    const result = new Result({
      examId: exam._id,
      userId: req.user._id,
      score: 0,
      correctAnswer: 0,
      wrongAnswer: 0,
      isCompleted: false,
      endTime,
    });

    await result.save();
    
    console.log(`✅ Created new result: ${result._id} for exam: ${exam._id}`);
    userLog(req, "Join Exam", `User joined exam with ID: ${req.params.examId}`);

    res.status(200).json({
      code: 200,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questions: shuffledQuestions,
      listeningExams: shuffledListeningExams,
      readingQuestion: readingQuestionsArray,
      resultId: result._id,
    });
  } catch (error) {
    console.error("❌ Error in joinedExam:", error);
    userLog(req, "Join Exam", `Error joining exam: ${error.message}`);
    res.status(500).json({ code: 500, message: "Lỗi khi tham gia đề thi." });
  }
};
export const getListeningExams = async (req, res) => {
  try {
    let currentPage = req.query.page ? parseInt(req.query.page) : 1;
    let limitItems = req.query.limit ? parseInt(req.query.limit) : 4;

    const condition = { isPublic: true };
    const totalItems = await ListeningExam.countDocuments(condition);
    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);

    const listeningExams = await ListeningExam.find(condition)
      .populate("questions")
      .limit(limitItems)
      .skip(skip);

    userLog(
      req,
      "View Listening Exams",
      `User accessed listening exams list on page ${currentPage} with limit ${limitItems}`
    );
    res.status(200).json({
      code: 200,
      listeningExams,
      currentPage,
      totalItems,
      totalPage,
      limitItems,
      hasNextPage: currentPage < totalPage,
    });
  } catch (error) {
    userLog(
      req,
      "View Listening Exams",
      `Error viewing listening exams: ${error.message}`
    );
    res.status(400).json({ code: 400, message: error.message });
  }
};

export const detailListeningExam = async (req, res) => {
  try {
    const { slug } = req.params;
    const listeningExam = await ListeningExam.findOne({ slug }).populate({
      path: "questions",
      populate: { path: "options" },
    });

    if (!listeningExam) {
      return res.status(404).json({ message: "Listening exam not found" });
    }

    userLog(
      req,
      "View Listening Exam Detail",
      `User viewed listening exam detail for slug: ${slug}`
    );
    res.status(200).json({ code: 200, listeningExam });
  } catch (error) {
    userLog(
      req,
      "View Listening Exam Detail",
      `Error viewing listening exam detail: ${error.message}`
    );
    res.status(400).json({ code: 400, message: error.message });
  }
};

export const joinListeningExam = async (req, res) => {
  try {
    const listeningExam = await ListeningExam.findOne({
      _id: req.params.examId,
    }).populate({
      path: "questions",
      populate: { path: "options" },
    });

    if (!listeningExam) {
      return res.status(404).json({ message: "Listening exam not found" });
    }

    const shuffledQuestions = shuffleArray(listeningExam.questions).map(
      (question) => ({
        ...question.toObject(),
        options: shuffleArray(question.options),
      })
    );

    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + listeningExam.duration);

    const result = new Result({
      examId: listeningExam._id,
      userId: req.user._id,
      score: 0,
      correctAnswer: 0,
      wrongAnswer: 0,
      isCompleted: false,
      endTime,
    });

    await result.save();

    userLog(
      req,
      "Join Listening Exam",
      `User joined listening exam with ID: ${req.params.examId}`
    );
    res.status(200).json({
      code: 200,
      title: listeningExam.title,
      description: listeningExam.description,
      duration: listeningExam.duration,
      questions: shuffledQuestions,
      resultId: result._id,
    });
  } catch (error) {
    userLog(
      req,
      "Join Listening Exam",
      `Error joining listening exam: ${error.message}`
    );
    res
      .status(500)
      .json({ code: 500, message: "Error joining listening exam." });
  }
};

export const calculateListeningExamScore = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await Result.findById(resultId).populate({
      path: "examId",
      populate: { path: "questions" },
    });

    if (!result || result.isCompleted) {
      return res.status(400).json({ message: "Invalid or completed result." });
    }

    const userAnswers = req.body.answers; // { questionId: selectedOptionId }
    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;

    for (const question of result.examId.questions) {
      const userAnswer = userAnswers[question._id];
      const correctOption = question.options.find((opt) => opt.isCorrect);

      if (
        userAnswer &&
        correctOption &&
        userAnswer === correctOption._id.toString()
      ) {
        score += 1;
        correctAnswer += 1;
      } else {
        wrongAnswer += 1;
      }
    }

    result.score = score;
    result.correctAnswer = correctAnswer;
    result.wrongAnswer = wrongAnswer;
    result.isCompleted = true;
    await result.save();

    userLog(
      req,
      "Calculate Listening Exam Score",
      `User calculated score for result ID: ${resultId}`
    );
    res.status(200).json({ code: 200, score, correctAnswer, wrongAnswer });
  } catch (error) {
    userLog(
      req,
      "Calculate Listening Exam Score",
      `Error calculating score: ${error.message}`
    );
    res.status(500).json({ code: 500, message: "Error calculating score." });
  }
};
