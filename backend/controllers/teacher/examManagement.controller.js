import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import { formatExamHeader } from "../../utils/examHeader.helper.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Passage } from "../../models/Passage.model.js";
import mongoose from "mongoose";
import { generateMultipleExamVariants } from "../../utils/generateMultipleExamVariants.js";
import {
  formatExamQuestions,
  formatFillInBlankQuestions,
  formatListeningQuestions,
  formatReadingQuestions,
} from "../../utils/examQuestions.helper.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Packer, Document } from "docx";

import XLSX from "xlsx";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [GET]: teacher/exam
// TODO: EXAM CỦA GIÁO VIÊN ĐÓ THÔI, KHÔNG PHẢI TẤT CẢ .
export const getAllExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, isPublic } = req.query; // Lấy các tham số từ query

    // Tạo bộ lọc (filter)
    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // Lọc theo tiêu đề (không phân biệt hoa thường)
    }
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === "true"; // Lọc theo trạng thái công khai
    }

    // Phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách đề thi dựa trên bộ lọc và phân trang
    const exams = await Exam.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian tạo

    // Đếm tổng số đề thi thỏa mãn bộ lọc
    const total = await Exam.countDocuments(filter);
    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đề thi thành công!",
      data: exams,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi lấy danh sách đề thi:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể lấy danh sách đề thi.",
      error: error.message,
    });
  }
};

// [GET]: teacher/exam/detail/:slug
export const getExamDetail = async (req, res) => {
  try {
    const { slug } = req.params; // Lấy slug từ URL

    // Tìm đề thi theo slug và populate danh sách câu hỏi và listeningExams
    const exam = await Exam.findOne({ slug })
      .populate({
        path: "questions",
        populate: { path: "passageId", strictPopulate: false }, // Populate passageId for each question
      })
      .populate("listeningExams");

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công với thông tin đề thi
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đề thi thành công!",
      data: exam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi lấy thông tin đề thi:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể lấy thông tin đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/toggle-visibility/:id
export const toggleExamVisibility = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    // Tìm đề thi theo id
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Chuyển đổi trạng thái công khai
    exam.isPublic = !exam.isPublic;

    // Lưu thay đổi
    await exam.save();

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: `Đề thi đã được ${
        exam.isPublic ? "công khai" : "ẩn"
      } thành công!`,
      data: {
        id: exam._id,
        title: exam.title,
        isPublic: exam.isPublic,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Lỗi server! Không thể cập nhật trạng thái công khai của đề thi.",
      error: error.message,
    });
  }
};

// [POST]: teacher/exam/create
export const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      duration,
      isPublic,
      startTime,
      endTime,
      listeningExams,
      class: examClass, // Add this line
      topic, // Add this line
      knowledge, // Add this line
    } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc! Vui lòng kiểm tra lại.",
      });
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Tạo đối tượng Exam mới
    const newExam = new Exam({
      title,
      description,
      questions,
      duration: duration || 90, // Sử dụng giá trị mặc định nếu không có
      isPublic: isPublic || false,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: req.user._id,
      listeningExams,
      class: examClass, // Add this line
      topic: topic || [], // Add this line
      knowledge: knowledge || [], // Add this line
    });

    // Lưu vào database
    const savedExam = await newExam.save();

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được tạo thành công!",
      data: savedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Error creating exam:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể tạo đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/update/:slug
export const updateExam = async (req, res) => {
  try {
    const { slug } = req.params; // Lấy slug từ URL
    const {
      title,
      description,
      questions,
      duration,
      isPublic,
      startTime,
      endTime,
      listeningExams,
      class: examClass, // Add this line
      topic, // Add this line
      knowledge, // Add this line
    } = req.body;

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Cập nhật đề thi dựa trên slug
    const updatedExam = await Exam.findOneAndUpdate(
      { slug },
      {
        title,
        description,
        questions,
        duration,
        isPublic,
        startTime,
        endTime,
        listeningExams,
        class: examClass, // Add this line
        topic: topic || [], // Add this line
        knowledge: knowledge || [], // Add this line
      },
      { new: true, runValidators: true } // Trả về tài liệu sau khi cập nhật
    );

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được cập nhật thành công!",
      data: updatedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể cập nhật đề thi.",
      error: error.message,
    });
  }
};

// [DELETE]: teacher/exam/delete/:id
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    // Tìm và xóa đề thi dựa trên _id
    const deletedExam = await Exam.findByIdAndDelete(id);

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!deletedExam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được xóa thành công!",
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi xóa đề thi:", error.message);

    // Trả về lỗi 500 cho client
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể xóa đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/schedule/:id
export const setExamSchedule = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của đề thi từ URL
    const { startTime, endTime } = req.body; // Lấy thời gian từ request body

    // Kiểm tra dữ liệu đầu vào
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thời gian! Cần có cả startTime và endTime.",
      });
    }

    // Kiểm tra logic thời gian
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Tìm và cập nhật thời gian của đề thi
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      { new: true, runValidators: true } // Trả về tài liệu sau khi cập nhật và kiểm tra ràng buộc
    );

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Lịch thi đã được cập nhật thành công!",
      data: updatedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Error setting exam schedule:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể đặt lịch thi.",
      error: error.message,
    });
  }
};
//[POST ]
export const autoGenerateExam = async (req, res) => {
  try {
    const { level, numberOfQuestions, duration, questionTypes } = req.body;

    if (
      !questionTypes ||
      !Array.isArray(questionTypes) ||
      questionTypes.length === 0
    ) {
      return res.status(400).json({
        code: 400,
        message: "Yêu cầu nhập loại câu hỏi ! ",
      });
    }

    let easyCount = 0,
      mediumCount = 0,
      hardCount = 0;

    if (level === "easy") {
      easyCount = numberOfQuestions;
    } else if (level === "medium") {
      mediumCount = Math.ceil(numberOfQuestions / 2);
      easyCount = numberOfQuestions - mediumCount;
    } else if (level === "hard") {
      hardCount = numberOfQuestions;
    } else {
      return res.status(400).json({
        code: 400,
        message: "Cấp độ phải là Easy, Medium hoặc Hard!",
      });
    }

    const selectedIds = new Set();
    let questions = [];

    const getQuestions = async (level, count) => {
      const results = await Question.aggregate([
        {
          $match: {
            level,
            questionType: {
              $in: questionTypes.map((id) => new mongoose.Types.ObjectId(id)),
            },
            _id: { $nin: [...selectedIds] },
          },
        },
        { $sample: { size: count } },
      ]);
      results.forEach((q) => selectedIds.add(q._id.toString()));
      return results;
    };

    const fillMissingQuestions = async (missingCount, preferredLevels) => {
      let added = [];
      for (let lvl of preferredLevels) {
        if (added.length >= missingCount) break;
        const more = await getQuestions(lvl, missingCount - added.length);
        added.push(...more);
      }
      return added;
    };

    // Lấy câu hỏi ban đầu theo từng mức độ
    let hardQuestions = await getQuestions("hard", hardCount);
    let mediumQuestions = await getQuestions("medium", mediumCount);
    let easyQuestions = await getQuestions("easy", easyCount);

    const missing = {
      hard: hardCount - hardQuestions.length,
      medium: mediumCount - mediumQuestions.length,
      easy: easyCount - easyQuestions.length,
    };

    // Bù thiếu theo chiến lược linh hoạt
    if (missing.hard > 0) {
      const filled = await fillMissingQuestions(missing.hard, [
        "medium",
        "easy",
      ]);
      hardQuestions.push(...filled);
    }
    if (missing.medium > 0) {
      const filled = await fillMissingQuestions(missing.medium, [
        "easy",
        "hard",
      ]);
      mediumQuestions.push(...filled);
    }
    if (missing.easy > 0) {
      const filled = await fillMissingQuestions(missing.easy, [
        "medium",
        "hard",
      ]);
      easyQuestions.push(...filled);
    }

    // Gộp lại
    questions = [...hardQuestions, ...mediumQuestions, ...easyQuestions];

    // Nếu vẫn thiếu => bù bất kỳ
    const stillNeed = numberOfQuestions - questions.length;
    if (stillNeed > 0) {
      const filler = await fillMissingQuestions(stillNeed, [
        "easy",
        "medium",
        "hard",
      ]);
      questions.push(...filler);
    }

    if (questions.length < numberOfQuestions) {
      return res.status(400).json({
        code: 400,
        message: "Không đủ câu hỏi theo yêu cầu !",
        detail: {
          required: numberOfQuestions,
          found: questions.length,
          missing: {
            hard: Math.max(0, hardCount - hardQuestions.length),
            medium: Math.max(0, mediumCount - mediumQuestions.length),
            easy: Math.max(0, easyCount - easyQuestions.length),
          },
        },
      });
    }

    // Shuffle
    questions.sort(() => Math.random() - 0.5);

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExam = new Exam({
      title: `Đề thi tạo tự động - (${randomCode})`,
      description: `Đề thi được tạo tự động với ${numberOfQuestions} câu hỏi`,
      questions: questions.slice(0, numberOfQuestions).map((q) => q._id),
      duration: duration || 90,
      isPublic: true,
      startTime: new Date(),
      endTime: new Date(Date.now() + (duration || 90) * 60 * 1000),
      createdBy: req.user._id,
    });

    await newExam.save();

    res.status(200).json({
      code: 200,
      message: "Tạo đề thi thành công!",
      exam: newExam,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      code: 500,
      message: "Lỗi server! Không thể tạo đề thi.",
    });
  }
};

//  Hàm Export Exam Into Word
export const exportExamIntoWord = async (req, res) => {
  try {
    const { slug } = req.body;

    // Fetch the exam by slug
    const exam = await Exam.findOne({ slug })
      .populate({
        path: "questions",
        populate: { path: "passageId", strictPopulate: false },
      })
      .populate({
        path: "listeningExams",
        populate: { path: "questions", strictPopulate: false },
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Prepare variants
    const variantCount = req.body.variant || 1;
    const variants = generateMultipleExamVariants(exam, variantCount);

    const exportPaths = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      // Prepare sections for the Word document
      const sectionChildren = [
        ...formatExamHeader(variant, variant.code),
        ...formatListeningQuestions(variant.listeningExams || []),
      ];

      // Group questions by passage
      const groupedQuestions = variant.questions.reduce((acc, question) => {
        const passageId = question.passageId?._id || "noPassage";
        if (!acc[passageId]) acc[passageId] = [];
        acc[passageId].push(question);
        return acc;
      }, {});

      // Add reading questions grouped by passage
      const readingQuestions = Object.entries(groupedQuestions).map(
        ([passageId, questions]) => ({
          passage: passageId === "noPassage" ? null : questions[0].passageId.content,
          questions,
        })
      );
      sectionChildren.push(...formatReadingQuestions(readingQuestions));

      // Add standalone questions (not associated with passages)
      const standaloneQuestions = groupedQuestions["noPassage"] || [];
      standaloneQuestions.forEach((question) => {
        if (question.questionType === "6742fb1cd56a2e75dbd817ea") {
          // Multiple Choice
          sectionChildren.push(...formatExamQuestions([question]));
        } else if (question.questionType === "6742fb3bd56a2e75dbd817ec") {
          // Fill in the Blank
          sectionChildren.push(...formatFillInBlankQuestions([question]));
        } else if (question.questionType === "6742fb5dd56a2e75dbd817ee") {
          // True/False/Not Given (convert to multiple-choice format)
          const convertedQuestion = {
            ...question,
            answers: [
              { text: "True", isCorrect: question.correctAnswerForTrueFalseNGV === "true" },
              { text: "False", isCorrect: question.correctAnswerForTrueFalseNGV === "false" },
              { text: "Not Given", isCorrect: question.correctAnswerForTrueFalseNGV === "not given" },
              { text: "None", isCorrect: false },
            ],
          };
          sectionChildren.push(...formatExamQuestions([convertedQuestion]));
        }
      });

      // Create the Word document
      const doc = new Document({
        sections: [
          {
            children: sectionChildren,
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      const fileName = `${exam.title} - ${variant.code}.docx`;
      const downloadPath = path.join(process.env.USERPROFILE, "Downloads", fileName);

      fs.writeFileSync(downloadPath, buffer);
      exportPaths.push(downloadPath);
    }

    res.status(200).json({
      success: true,
      message: `${variantCount} mã đề đã được export thành công.`,
      files: exportPaths.map((p) => path.basename(p)),
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).send({ error: error.message });
  }
};

//Copy exam from other teacher
export const copyExamFromOthers = async (req, res) => {
  try {
    const { examId } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }
    const newExam = new Exam({
      title: exam.title,
      description: exam.description,
      questions: exam.questions,
      duration: exam.duration,
      isPublic: exam.isPublic,
      startTime: exam.startTime,
      endTime: exam.endTime,
      createdBy: req.user._id,
      listeningExams: exam.listeningExams, // Add this line
    });
    await newExam.save();
    return res.status(200).json({
      success: true,
      message: "Sao chép đề thi thành công!",
      data: newExam,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
// Import Excel Exam
export const importExamFromExcel = async (req, res) => {
  try {
    const passageFile = req.files?.passageFile?.[0];
    const examFile = req.files?.examFile?.[0];
    const originalName = Buffer.from(examFile.originalname, "latin1").toString(
      "utf8"
    );
    const title = originalName
      .split(".")[0]
      .replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, "_")
      .replace(/\s+/g, "_");

    if (!passageFile && !examFile) {
      return res.status(400).json({
        success: false,
        message: "Missing passageFile or examFile",
      });
    }

    const questionTypes = await QuestionType.find({ deleted: false });
    const questionTypeMap = Object.fromEntries(
      questionTypes.map((q) => [q.name.toLowerCase().trim(), q._id])
    );

    const normalize = (str, type = "default") => {
      if (!str) return type === "level" ? "easy" : ""; // Default to "easy" for level, empty string otherwise
      const normalized = str.toLowerCase().trim();
      // Handle common typos or variations
      const typoCorrections = {
        "mutiple choices": "multiple choices",
        "fill in blank": "fill in the blank",
        "true/false/ng": "true/false/not given",
      };
      return typoCorrections[normalized] || normalized;
    };

    const getFormattedHtml = (sheet, row, colName) => {
      const cellAddress = `${colName}${row}`;
      const cell = sheet[cellAddress];
      if (!cell || !cell.v) return "";
      if (cell.h) return cell.h; // If HTML formatted string exists
      return cell.v.toString(); // fallback to plain text
    };
    const groupedQuestions = new Map(); // passageId -> questions[]
    if (passageFile && examFile) {
      const passageWorkbook = XLSX.read(passageFile.buffer, {
        type: "buffer",
        cellStyles: true,
      });
      const examWorkbook = XLSX.read(examFile.buffer, {
        type: "buffer",
        cellStyles: true,
      });

      const passageSheet =
        passageWorkbook.Sheets[passageWorkbook.SheetNames[0]];
      const examSheet = examWorkbook.Sheets[examWorkbook.SheetNames[0]];

      const passageData = XLSX.utils.sheet_to_json(passageSheet, { header: 1 });
      const examData = XLSX.utils.sheet_to_json(examSheet, { header: 1 });

      const passageHeaders = passageData[0];
      const passageRows = passageData.slice(1);

      const passageMap = new Map();
      for (let i = 0; i < passageRows.length; i++) {
        const row = passageRows[i];
        const obj = {};
        for (let j = 0; j < passageHeaders.length; j++) {
          const col = passageHeaders[j];
          obj[col] = getFormattedHtml(
            passageSheet,
            i + 2,
            String.fromCharCode(65 + j)
          ); // e.g., A, B, C
        }
        passageMap.set(obj.PassageId, {
          title: obj.Title,
          content: obj.Content,
        });
      }

      const examHeaders = examData[0];
      const examRows = examData.slice(1);

      const singleQuestions = [];

      for (let i = 0; i < examRows.length; i++) {
        const row = examRows[i];
        const question = {};
        for (let j = 0; j < examHeaders.length; j++) {
          const col = examHeaders[j];
          question[col] = getFormattedHtml(
            examSheet,
            i + 2,
            String.fromCharCode(65 + j)
          );
        }

        const normalizedType = normalize(question.QuestionType);
        const questionTypeId = questionTypeMap[normalizedType];

        if (!questionTypeId) {
          return res.status(400).json({
            success: false,
            message: `Invalid QuestionType: ${question.QuestionType}`,
          });
        }

        const baseData = {
          content: question.Content,
          instruction: question?.Instruction,
          topic: question?.Topic,
          questionType: questionTypeId,
          level: normalize(question.Level, "level"), // Ensure level is normalized with a default value
          author: req.user._id,
          knowledge: question?.Knowledge,
          translation: question?.Translation,
          explanation: question?.Explaination,
        };

        // Validate the level field
        if (!["easy", "medium", "hard"].includes(baseData.level)) {
          return res.status(400).json({
            success: false,
            message: `Invalid level: ${baseData.level}. Allowed values are "easy", "medium", "hard".`,
          });
        }

        if (question.PassageId) {
          if (!groupedQuestions.has(question.PassageId)) {
            groupedQuestions.set(question.PassageId, []);
          }

          if (normalizedType === "true/false/not given") {
            groupedQuestions.get(question.PassageId).push({
              ...baseData,
              correctAnswerForTrueFalseNGV: question.CorrectAnswers.toString()
                .replace(/\s+/g, "")
                .toLowerCase(),
            });
          } else if (normalizedType === "fill in the blank") {
            groupedQuestions.get(question.PassageId).push({
              ...baseData,
              answers: [
                { correctAnswerForBlank: question.CorrectAnswers.toString() },
              ],
            });
          } else if (normalizedType === "multiple choices") {
            groupedQuestions.get(question.PassageId).push({
              ...baseData,
              answers: ["A", "B", "C", "D"].map((option) => ({
                text: question["Answer" + option],
                isCorrect: question.CorrectAnswers.includes(option),
              })),
            });
          }
        } else {
          if (normalizedType === "true/false/not given") {
            singleQuestions.push({
              ...baseData,
              correctAnswerForTrueFalseNGV: question.CorrectAnswers.toString()
                .replace(/\s+/g, "")
                .toLowerCase(),
            });
          } else if (normalizedType === "fill in the blank") {
            singleQuestions.push({
              ...baseData,
              answers: [
                { correctAnswerForBlank: question.CorrectAnswers.toString() },
              ],
            });
          } else if (normalizedType === "multiple choices") {
            singleQuestions.push({
              ...baseData,
              answers: ["A", "B", "C", "D"].map((option) => ({
                text: question["Answer" + option],
                isCorrect: question.CorrectAnswers.includes(option),
              })),
            });
          }
        }
      }

      const questionSaves = [];

      for (const [passageId, questions] of groupedQuestions.entries()) {
        const passageInfo = passageMap.get(passageId);
        if (!passageInfo) continue;

        const newPassage = new Passage({
          title: passageInfo.title,
          content: passageInfo.content,
        });

        await newPassage.save();

        for (const q of questions) {
          const question = new Question({
            ...q,
            passageId: newPassage._id,
          });
          questionSaves.push(question.save());
        }
      }
      // Tính top 3 topic và knowledge phổ biến nhất
      const countFrequency = (arr) => {
        const map = {};
        for (const item of arr) {
          if (!item) continue;
          map[item] = (map[item] || 0) + 1;
        }
        return Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([key]) => key);
      };

      const allTopics = [
        ...singleQuestions,
        ...Array.from(groupedQuestions.values()).flat(),
      ]
        .map((q) => q.topic?.trim())
        .filter(Boolean);

      const allKnowledges = [
        ...singleQuestions,
        ...Array.from(groupedQuestions.values()).flat(),
      ]
        .map((q) => q.knowledge?.trim())
        .filter(Boolean);

      const topTopics = countFrequency(allTopics);
      const topKnowledges = countFrequency(allKnowledges);

      for (const q of singleQuestions) {
        const question = new Question(q);
        questionSaves.push(question.save());
      }

      const savedQuestions = await Promise.all(questionSaves);
      const questionIds = savedQuestions.map((q) => q._id);

      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      //title là tên của file excel
      const newExam = new Exam({
        title: title,
        description: "Đề thi được nhập từ excel mã: " + randomCode,
        questions: questionIds,
        duration: 90,
        isPublic: true,
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: req.user._id,
        topic: topTopics,
        knowledge: topKnowledges,
      });

      await newExam.save();

      return res.status(200).json({
        success: true,
        message: "Import exam successfully!",
        data: { exam: newExam },
      });
    } else if (examFile && !passageFile) {
      const examWorkbook = XLSX.read(examFile.buffer, {
        type: "buffer",
        cellStyles: true,
      });
      const examSheet = examWorkbook.Sheets[examWorkbook.SheetNames[0]];
      const examData = XLSX.utils.sheet_to_json(examSheet, { header: 1 });

      const headers = examData[0];
      const rows = examData.slice(1);
      const singleQuestions = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const question = {};
        for (let j = 0; j < headers.length; j++) {
          const col = headers[j];
          question[col] = getFormattedHtml(
            examSheet,
            i + 2,
            String.fromCharCode(65 + j)
          );
        }

        const normalizedType = normalize(question.QuestionType);
        const questionTypeId = questionTypeMap[normalizedType];

        if (!questionTypeId) {
          return res.status(400).json({
            success: false,
            message: `Invalid QuestionType: ${question.QuestionType}`,
          });
        }

        const baseData = {
          content: question.Content,
          topic: question?.Topic,
          instruction: question?.Instruction,
          questionType: questionTypeId,
          level: normalize(question.Level, "level"), // Ensure level is normalized with a default value
          author: req.user._id,
          knowledge: question?.Knowledge,
          translation: question?.Translation,
          explanation: question?.Explaination,
        };

        // Validate the level field
        if (!["easy", "medium", "hard"].includes(baseData.level)) {
          return res.status(400).json({
            success: false,
            message: `Invalid level: ${baseData.level}. Allowed values are "easy", "medium", "hard".`,
          });
        }

        if (normalizedType === "true/false/not given") {
          singleQuestions.push({
            ...baseData,
            correctAnswerForTrueFalseNGV: question.CorrectAnswers.toString()
              .replace(/\s+/g, "")
              .toLowerCase(),
          });
        } else if (normalizedType === "fill in the blank") {
          singleQuestions.push({
            ...baseData,
            answers: [
              { correctAnswerForBlank: question.CorrectAnswers.toString() },
            ],
          });
        } else if (normalizedType === "multiple choices") {
          singleQuestions.push({
            ...baseData,
            answers: ["A", "B", "C", "D"].map((option) => ({
              text: question["Answer" + option],
              isCorrect: question.CorrectAnswers.includes(option),
            })),
          });
        }
      }
      //topic && knowledge của exam tính trong câu hỏi
      // Tính top 3 topic và knowledge phổ biến nhất
      const countFrequency = (arr) => {
        const map = {};
        for (const item of arr) {
          if (!item) continue;
          map[item] = (map[item] || 0) + 1;
        }
        return Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([key]) => key);
      };

      const allTopics = [
        ...singleQuestions,
        ...Array.from(groupedQuestions.values()).flat(),
      ]
        .map((q) => q.topic?.trim())
        .filter(Boolean);

      const allKnowledges = [
        ...singleQuestions,
        ...Array.from(groupedQuestions.values()).flat(),
      ]
        .map((q) => q.knowledge?.trim())
        .filter(Boolean);

      const topTopics = countFrequency(allTopics);
      const topKnowledges = countFrequency(allKnowledges);

      // Save all questions to the database
      const questionSaves = singleQuestions.map((q) => new Question(q).save());
      const savedQuestions = await Promise.all(questionSaves);
      const questionIds = savedQuestions.map((q) => q._id);
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      //title là tên của file excel
      //hiển thị title có dấu
      const newExam = new Exam({
        title: title,
        description: "Đề thi được nhập từ excel mã: " + randomCode,
        questions: questionIds,
        duration: 90,
        isPublic: true,
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: req.user._id,
        topic: topTopics,
        knowledge: topKnowledges,
      });
      await newExam.save();

      return res.status(200).json({
        success: true,
        message: "Import exam successfully (only questions)!",
        data: { exam: newExam },
      });
    }
  } catch (error) {
    console.error("Error in importExamFromExcel:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during the import.",
    });
  }
};
