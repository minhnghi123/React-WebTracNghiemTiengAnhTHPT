import ListeningExam from "../../models/listeningExam.model.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Audio } from "../../models/Audio.model.js";
import XLSX from "xlsx";
import mongoose from "mongoose";
import ListeningQuestion from "../../models/ListeningQuestion.js";

export const createListeningExamController = async (req, res) => {
  try {
    const data = req.body;

    const newExam = new ListeningExam(data);

    await newExam.save();

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
    console.log(examFile, audioFile);
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
    const audioDoc = await Audio.create({
      filePath: audioFile.filePath,
      description: "Audio bài nghe thử nghiệm",
      transcription: "Transcription bài nghe thử nghiệm",
    });

    const questionType = await QuestionType.findOne({
      name: "Mutiple Choices",
    });
    console.log(questionType);

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
      } = row;

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
        .filter(Boolean); // loại bỏ null

      const newQuestion = await ListeningQuestion.create({
        teacherId: req.user._id,
        questionText: Content,
        questionType: questionType?._id,
        options,
        correctAnswer,
        difficulty: Level.toLowerCase(),
      });

      createdQuestions.push(newQuestion._id);
    }

    const newExam = await ListeningExam.create({
      teacherId: req.user._id,
      title: `Bài kiểm tra nghe ${Date.now()}`,
      description: "Bài kiểm tra nghe tự động tạo từ file Excel",
      audio: audioDoc._id,
      questions: createdQuestions,
      duration: 90,
      startTime: new Date(),
      endTime: new Date(Date.now() + 90 * 60 * 1000),
      isPublic: false,
    });

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
