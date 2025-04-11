import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import { formatExamHeader } from "../../utils/examHeader.helper.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Passage } from "../../models/Passage.model.js";

import { generateMultipleExamVariants } from "../../utils/generateMultipleExamVariants.js";
import {
  formatExamQuestions,
  formatFillInBlankQuestions,
  formatListeningQuestions,
} from "../../utils/examQuestions.helper.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Packer, Document } from "docx";

import XLSX from "xlsx";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [GET]: teacher/exam
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
      listeningExams, // Add this line
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
      listeningExams, // Add this line
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
    } = req.body;

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // if (startTime && new Date(startTime) < new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Thời gian bắt đầu không thể là quá khứ!",
    //   });
    // }

    // if (startTime && new Date(startTime) < new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Thời gian bắt đầu không thể là quá khứ!",
    //   });
    // }

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
        message: "Question types are required!",
      });
    }

    let numberOfEasyQuestions = 0,
      numberOfHardQuestions = 0;

    if (level === "Easy") {
      numberOfEasyQuestions = numberOfQuestions;
    } else if (level === "Medium") {
      numberOfHardQuestions = Math.ceil(numberOfQuestions / 2);
      numberOfEasyQuestions = numberOfQuestions - numberOfHardQuestions;
    } else {
      numberOfHardQuestions = numberOfQuestions;
    }

    // Lấy câu hỏi khó trước
    let hardQuestions = await Question.aggregate([
      { $match: { level: "hard", questionType: { $in: questionTypes } } },
      { $sample: { size: numberOfHardQuestions } },
    ]);

    let remainingHardNeeded = numberOfHardQuestions - hardQuestions.length;

    // Nếu không đủ câu hỏi khó, thì bù bằng câu hỏi dễ
    let easyQuestions = await Question.aggregate([
      { $match: { level: "easy", questionType: { $in: questionTypes } } },
      { $sample: { size: numberOfEasyQuestions + remainingHardNeeded } },
    ]);

    if (easyQuestions.length < numberOfEasyQuestions + remainingHardNeeded) {
      return res.status(400).json({
        code: 400,
        message: `Not enough questions! Found: ${
          hardQuestions.length + easyQuestions.length
        }, Required: ${numberOfQuestions}`,
      });
    }

    // Nếu không đủ câu khó, lấy từ câu dễ để bù vào
    if (remainingHardNeeded > 0) {
      hardQuestions = [
        ...hardQuestions,
        ...easyQuestions.splice(0, remainingHardNeeded),
      ];
    }

    const questions = [...easyQuestions, ...hardQuestions];

    // Xáo trộn danh sách câu hỏi
    questions.sort(() => Math.random() - 0.5);

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExam = new Exam({
      title: `Auto-generated exam(${randomCode})`,
      description: `This is an auto-generated exam with ${numberOfQuestions} questions`,
      questions: questions.map((q) => q._id),
      duration: duration || 90,
      isPublic: true,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour sau
      createdBy: req.user._id,
    });

    await newExam.save();

    res.status(200).json({
      code: 200,
      message: "Create exam successfully!",
      exam: newExam,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      code: 500,
      message: "Internal server error!",
    });
  }
};

//  Hàm Export Exam Into Word
export const exportExamIntoWord = async (req, res) => {
  try {
    const data = req.body;

    const variantCount = data.variant;
    const variants = generateMultipleExamVariants(data, variantCount);

    const exportPaths = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      const doc = new Document({
        sections: [
          {
            children: [
              ...formatExamHeader(variant, variant.code),
              ...formatExamQuestions(variant.questionsMultichoice),
              ...formatFillInBlankQuestions(variant.questionsFillInBlank),
              ...formatListeningQuestions(variant.questionsListening),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      const fileName = `${data.title} - ${variant.code}.docx`;
      const downloadPath = path.join(
        process.env.USERPROFILE,
        "Downloads",
        fileName
      );

      fs.writeFileSync(downloadPath, buffer);
      exportPaths.push(downloadPath);
    }

    res.status(200).json({
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

    const normalize = (str) => str?.toLowerCase()?.trim();

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
        console.log(normalizedType, questionTypeId);
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
          level: normalize(question.Level),
          author: req.user._id,
          knowledge: question?.Knowledge,
          translation: question?.Translation,
          explanation: question?.Explaination,
        };

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
          level: normalize(question.Level),
          author: req.user._id,
          knowledge: question?.Knowledge,
          translation: question?.Translation,
          explanation: question?.Explaination,
        };

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

// // Cấu hình Multer để upload file Word
// const upload = multer({ dest: "uploads/" });
// // Hàm trích xuất nội dung từ file Word
// const extractContentFromWord = async (filePath) => {
//   try {
//     const result = await mammoth.convertToHtml({ path: filePath });
//     return result.value;
//   } catch (error) {
//     throw new Error(`Lỗi trích xuất nội dung: ${error.message}`);
//   }
// };

// // Hàm phân tích đáp án từ bảng
// const parseAnswerKey = (html) => {
//   const $ = cheerio.load(html);
//   const answerKey = {};

//   // Tìm bảng đáp án
//   const answerTable = $('p:has(strong:contains("ĐÁP ÁN THAM"))')
//     .nextAll("table")
//     .first();

//   // Kiểm tra nếu bảng tồn tại
//   if (!answerTable.length) {
//     console.error("Không tìm thấy bảng đáp án.");
//     return {};
//   }

//   // Duyệt qua từng ô trong bảng
//   answerTable.find("td").each((_, cell) => {
//     const cellText = $(cell).text().trim(); // Lấy nội dung
//     const matches = cellText.match(/^(\d+)\.([A-D])$/); // Bắt cặp dạng "1.C"

//     if (matches) {
//       const [_, questionNumber, answer] = matches;
//       answerKey[questionNumber] = answer;
//     }
//   });

//   return answerKey;
// };

// // Hàm phân tích câu hỏi và đoạn văn
// const parseQuestionsAndPassages = (html, answerKey) => {
//   const $ = cheerio.load(html);
//   const elements = $("p").toArray();
//   const data = { questions: [], passages: [] };
//   for (let i = 0; i < elements.length; i++) {
//     let text = $(elements[i]).text().trim();
//     let htmlContent = $(elements[i]).html();
//     let questionKnowledge;
//     // Xử lý đoạn văn (passage)
//     if (text.startsWith("Read the following passage")) {
//       //the next line is the content of the passage
//       // console.warn(text);
//       let nextText = $(elements[i + 1])
//         .html()
//         .trim();
//       let passageContent = nextText + "\n";
//       while (!nextText.includes("Question")) {
//         // console.log(nextText);
//         passageContent += nextText + "\n";
//         nextText = $(elements[i++]).html().trim();
//       }
//       let passage = {
//         id: uuidv4().toString(),
//         title: text,
//         content: passageContent,
//       };
//       data.passages.push(passage);
//       //handle reading questions
//       while (nextText.includes("Question")) {
//         //that will be 2 case ;
//         //Case 1 : in a row that have A,B,C,D question => word form type
//         if (
//           nextText.includes("A.") &&
//           nextText.includes("B.") &&
//           nextText.includes("C.") &&
//           nextText.includes("D.")
//         ) {
//           let questionNumber = nextText.match(/Question (\d+):/)[1];

//           let questionContent = nextText.replace(/Question \d+:/, "").trim();

//           let textContent = $(elements[i - 1])
//             .text()
//             .trim();

//           const choices = textContent
//             .match(/[A-D]\.\s*[^\s][^A-D]*/g)
//             .map((choice) => choice.replace(/\s+/g, " ").trim());
//           //create new question
//           data.questions.push({
//             questionNumber,
//             passageId: passage.id,
//             questionContent,
//             choices,
//             correctAnswer: answerKey[questionNumber],
//             questionType: "word_form",
//           });
//         } else {
//           //Case 2 : in a row has the question and below will have a,b,c,d question => mutiple choices
//           let questionNumber = nextText.match(/Question (\d+):/)[1];
//           let questionContent = nextText.replace(/Question \d+:/, "").trim();
//           //the below will be the 4 options A,B,C,D , they may be laid in one or two rows
//           let collection = [];
//           nextText = $(elements[i++]).html().trim();
//           while (
//             !nextText.includes("Question") &&
//             (nextText.includes("A.") ||
//               nextText.includes("B.") ||
//               nextText.includes("C.") ||
//               nextText.includes("D."))
//           ) {
//             // collection.push(nextText);
//             let textContent = $(elements[i - 1])
//               .text()
//               .trim();
//             const choices = textContent
//               .match(/[A-D]\.\s*[^A-D].*?(?=\s*[A-D]\.|$)/g)
//               .map((choice) =>
//                 collection.push(choice.replace(/\s+/g, " ").trim())
//               );
//             nextText = $(elements[i++]).html().trim();
//           }
//           // console.log(questionNumber, questionContent);
//           data.questions.push({
//             questionNumber,
//             passageId: passage.id,
//             questionContent,
//             choices: collection,
//             correctAnswer: answerKey[questionNumber],
//             questionType: "multiple_choices",
//           });
//           i--;
//         }

//         nextText = $(elements[i++]).html().trim();
//       }
//     } else {
//       //solve multiple choices questions
//       // TODO: implement basic questions parsing
//       if (text.startsWith("Mark")) {
//         ++i;
//         let nextText = $(elements[i]).html().trim();
//         if (text.includes("indicate the word whose underlined part differs")) {
//           questionKnowledge = "pronunciation";
//           while (nextText.includes("Question")) {
//             // console.log(nextText);
//             let questionNumber = nextText.match(/Question (\d+):/)[1];

//             let questionContent = nextText.replace(/Question \d+:/, "").trim();

//             let htmlContent = $(elements[i]).html().trim(); // Lấy toàn bộ HTML thay vì chỉ text

//             const choices = htmlContent
//               .match(/([A-D]\.\s*(?:<[^>]+>)*\s*[^<]+(?:<[^>]+>)*)/g)
//               .map((choice) => choice.trim()); // Chuẩn hóa khoảng trắng
//             console.log(choices);
//             ++i;
//             nextText = $(elements[i]).html().trim();
//           }
//         }
//         // else if (
//         //   text.includes(
//         //     "indicate the word that differs from the other three in the position of stress"
//         //   )
//         // ) {
//         //   questionKnowledge = "stress";
//         // } else if (
//         //   text.includes(
//         //     "indicate the sentence that best completes each of the following exchanges"
//         //   )
//         // ) {
//         //   questionKnowledge = "exchanges";
//         // } else if (
//         //   text.includes(
//         //     "indicate the sentence that best combines each pair of sentences"
//         //   )
//         // ) {
//         //   questionKnowledge = "sentence_combination";
//         // } else if (
//         //   text.includes("indicate the underlined part that needs correction")
//         // ) {
//         //   questionKnowledge = "error_correction";
//         // } else if (
//         //   text.includes("indicate the sentence that is closest in meaning")
//         // ) {
//         //   questionKnowledge = "closest_meaning";
//         // }
//       }
//     }
//   }
//   // console.log(data);
//   return data;
// };

// // Hàm chính nhập đề thi
// export const importExamFromWord = async (req, res) => {
//   // Upload file Word và trích xuất nội dung
//   upload.single("examFile")(req, res, async (err) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         message: "Lỗi khi upload file!",
//         error: err.message,
//       });
//     }
//     try {
//       const filePath = req.file.path;
//       const html = await extractContentFromWord(filePath);
//       const answerKey = parseAnswerKey(html);
//       // console.log(answerKey);
//       const { questions, passages } = parseQuestionsAndPassages(
//         html,
//         answerKey
//       );
//       // console.log(passages);

//       fs.unlinkSync(filePath);
//       res.status(200).json({ success: true });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });
// };
