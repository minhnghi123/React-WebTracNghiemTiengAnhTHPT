import ListeningExam from "../../models/listeningExam.model.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Audio } from "../../models/Audio.model.js";
import XLSX from "xlsx";
import mongoose from "mongoose";
import ListeningQuestion from "../../models/ListeningQuestion.js";
import { userLog } from "../../utils/logUser.js";

export const createListeningExamController = async (req, res) => {
  try {
    const data = req.body;

    const newExam = new ListeningExam(data);

    await newExam.save();

    userLog(req, "Create Listening Exam", "Created a new listening exam.");

    return res.status(201).json({
      message: "Bài kiểm tra đã được tạo thành công!",
      data: newExam,
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể tạo bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const getAllListeningExamsController = async (req, res) => {
  try {
    const token = req.cookies["jwt-token"];
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const teacherId = decoded.userId;

    const exams = await ListeningExam.find({
      $or: [
        { isDeleted: false, isPublished: true },
        { isDeleted: false, teacherId: teacherId },
      ],
    })
      .populate("questions")
      .populate("teacherId")
      .populate("audio");

    userLog(req, "Fetch Listening Exams", "Fetched all listening exams.");

    return res.status(200).json({
      message: "Danh sách bài kiểm tra",
      data: exams,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const getAllListeningExamsOfMyselfController = async (req, res) => {
  try {
    const teacherId = req.userId;
    const exams = await ListeningExam.find({
      isDeleted: false,
      teacherId: teacherId,
    })
      .populate("questions")
      .populate("teacherId")
      .populate("audio");

    userLog(req, "Fetch My Listening Exams", "Fetched all listening exams created by the user.");

    return res.status(200).json({
      message: "Danh sách bài kiểm tra của bạn",
      data: exams,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const updateListeningExamController = async (req, res) => {
  try {
    const { examId } = req.params;
    const updateData = req.body;

    const updatedExam = await ListeningExam.findByIdAndUpdate(
      examId,
      updateData,
      { new: true, runValidators: true }
    );

    userLog(req, "Update Listening Exam", `Updated listening exam with ID: ${req.params.examId}`);

    return res.status(200).json({
      message: "Cập nhật bài kiểm tra thành công!",
      data: updatedExam,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể cập nhật bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const deleteExamController = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await ListeningExam.findByIdAndUpdate(
      examId,
      { isDeleted: true },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Bài kiểm tra không tồn tại." });
    }

    userLog(req, "Delete Listening Exam", `Soft deleted listening exam with ID: ${req.params.examId}`);

    return res.status(200).json({
      message: "Bài kiểm tra đã được xóa thành công (soft delete).",
    });
  } catch (error) {
    console.error("Error during exam soft delete:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xóa bài kiểm tra." });
  }
};

export const importListeningExamController = async (req, res) => {
  try {
    const examFile = req.files?.examFile?.[0];
    const audioFile = req.files?.audioFile?.[0];

    if (!examFile || !audioFile) {
      return res
        .status(400)
        .json({ message: "Vui lòng tải cả bài kiểm tra và âm thanh." });
    }

    // Read Excel
    const workbook = XLSX.read(examFile.buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Tạo audio document
    // console.log("filePath: ", req?.body?.audioFile);
    const originalName = Buffer.from(examFile.originalname, "latin1").toString(
      "utf8"
    );
    const title = originalName
      .split(".")[0]
      .replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, "_")
      .replace(/\s+/g, "_");
    const audioDoc = await Audio.create({
      filePath: req?.body?.audioFile,
      description: title,
      transcription: "Transcription bài nghe thử nghiệm",
    });
    const questionType = await QuestionType.findOne({
      name: "Multiple Choices",
    });

    const createdQuestions = [];
    for (const row of rows) {
      const {
        Content,
        Level,
        AnswerA,
        AnswerB,
        AnswerC,
        AnswerD,
        CorrectAnswers,
        QuestionType: RowQuestionType,
      } = row;

      const questionType = await QuestionType.findOne({
        name: RowQuestionType || "Multiple Choices",
      });

      let newQuestion;

      if (questionType?.name === "Multiple Choices") {
        const options = [
          { optionText: AnswerA },
          { optionText: AnswerB },
          { optionText: AnswerC },
          { optionText: AnswerD },
        ].map((opt) => ({ option_id: new mongoose.Types.ObjectId(), ...opt }));

        const correctLetters = CorrectAnswers.toUpperCase()
          .split(",")
          .map((l) => l.trim());

        const indexMap = { A: 0, B: 1, C: 2, D: 3 };

        const correctAnswer = correctLetters
          .map((letter) => {
            const index = indexMap[letter];
            if (index === undefined) return null;
            return {
              answer_id: options[index]?.option_id,
              answer: options[index]?.optionText,
            };
          })
          .filter(Boolean);

        newQuestion = await ListeningQuestion.create({
          teacherId: req.user._id,
          questionText: Content,
          questionType: questionType?._id,
          options,
          correctAnswer,
          difficulty: Level.toLowerCase(),
        });
      } else if (questionType?.name === "Fill in the blank") {
        newQuestion = await ListeningQuestion.create({
          teacherId: req.user._id,
          questionText: Content,
          questionType: questionType?._id,
          blankAnswer: CorrectAnswers,
          difficulty: Level.toLowerCase(),
        });
      } else if (questionType?.name === "True/False/Not Given") {
        const validValues = ["true", "false", "notgiven"];
        const value = String(CorrectAnswers).toLowerCase().trim();
        if (!validValues.includes(value)) {
          console.warn(`Giá trị TFNG không hợp lệ: ${CorrectAnswers}`);
          continue; // bỏ qua nếu không hợp lệ
        }

        newQuestion = await ListeningQuestion.create({
          teacherId: req.user._id,
          questionText: Content,
          questionType: questionType?._id,
          correctAnswerForTrueFalseNGV: value,
          difficulty: Level.toLowerCase(),
        });
      } else {
        continue; // Không xử lý loại khác
      }

      createdQuestions.push(newQuestion._id);
    }

    const newExam = await ListeningExam.create({
      teacherId: req.user._id,
      title: title,
      description: "Bài kiểm tra nghe tự động tạo từ file Excel",
      audio: audioDoc._id,
      questions: createdQuestions,
      duration: 90,
      startTime: new Date(),
      endTime: new Date(Date.now() + 90 * 60 * 1000),
      isPublic: false,
    });

    userLog(req, "Import Listening Exam", "Imported a listening exam from files.");

    res.status(200).json({
      success: true,
      message: "Import bài nghe thành công.",
      exam: newExam,
    });
  } catch (error) {
    console.error("Lỗi import:", error);
    res.status(500).json({
      message: "Không thể import bài nghe.",
      error: error.message,
    });
  }
};
