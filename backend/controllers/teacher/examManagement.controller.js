import Exam from "../../models/Exam.model.js";
import { Question } from "../../models/Question.model.js";
import { formatExamHeader } from "../../utils/examHeader.helper.js";
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
import mammoth from "mammoth";
import slugify from "slugify";
import multer from "multer";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
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
      .populate("questions")
      .populate("listeningExams"); // Add this line

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
      { title, description, questions, duration, isPublic, startTime, endTime },
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

// 📚 Hàm Export Exam Into Word
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
      const downloadPath = path.join(process.env.USERPROFILE, "Downloads", fileName);

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

// Cấu hình Multer để upload file Word
const upload = multer({ dest: "uploads/" });
// Bước 1: Trích xuất nội dung file Word
const extractTextFromWord = async (filePath) => {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    return result.value;
  } catch (error) {
    console.error("Lỗi khi trích xuất nội dung:", error);
    return null;
  }
};

// Bước 2: Phân tích dữ liệu từ HTML
const parseExamData = (html) => {
  const $ = cheerio.load(html);
  const lines = $("p")
    .map((_, el) => $(el).text().trim())
    .get();

  const questions = [];
  const passages = [];

  for (let i = 0; i < lines.length; i++) {
    // handle passage question
    if (
      lines[i].startsWith("Reading the following passage") ||
      lines[i].startsWith("Read the following passage")
    ) {
      let passage = lines[i] + "\n";
      let j = i + 1;
      while (!lines[j].startsWith("Question")) {
        passage += lines[j] + "\n";
        j++;
      }
      passages.push({ content: passage.trim() });
      // make sure the next lines will be its questions, traversal it until get the 'Mark' signals
      while (j < lines.length && lines[j].startsWith("Question")) {
        // there will be 2 cases that if start with the question and this line contains 'A', 'B', 'C', 'D' => fill in the blank question
        if (
          lines[j].includes("A.") &&
          lines[j].includes("B.") &&
          lines[j].includes("C.") &&
          lines[j].includes("D.")
        ) {
          questions.push({ content: lines[j], type: "fill-in-the-blank" });
          j++;
        }
        // else if start with the question, => the next lines will be its part of answer
        else {
          let question = lines[j];
          j++;
          while (
            lines[j].includes("A.") ||
            lines[j].includes("B.") ||
            lines[j].includes("C.") ||
            lines[j].includes("D.")
          ) {
            question += "\n" + lines[j];
            j++;
          }
          questions.push({ content: question, type: "multiple-choice" });
        }
      }
      i = j - 1;
    }
    // handle other questions
    else {
      // stress question, if the line contains 'stress' => the next lines will be its part of answer
      if (lines[i].includes("stress")) {
        let question = lines[i];
        i++;
        while (
          lines[i].includes("A.") &&
          lines[i].includes("B.") &&
          lines[i].includes("C.") &&
          lines[i].includes("D.")
        ) {
          question += "\n" + lines[i];
          i++;
        }
        questions.push({ content: question, type: "stress" });
      }
      // multiple questions
      else {
        questions.push({ content: lines[i], type: "multiple-choice" });
      }
    }
  }

  return { questions, passages };
};

// Bước 3: Import đề thi vào MongoDB
const importExam = async (filePath, userId) => {
  const html = await extractTextFromWord(filePath);
  const { questions, passages } = parseExamData(html);
  console.log("Passages:", passages);
  console.log("Questions:", questions);

  // // Save passages to the database
  // const savedPassages = await Passage.insertMany(passages);

  // // Save questions to the database
  // const savedQuestions = await Question.insertMany(
  //   questions.map((q) => ({
  //     ...q,
  //     createdBy: userId,
  //   }))
  // );

  console.log("✅ Đề thi đã được nhập thành công!");
  // return { savedQuestions, savedPassages };
};

// API Upload file và import đề thi
export const importExamFromWord = async (req, res) => {
  upload.single("examFile")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi upload file!",
        error: err.message,
      });
    }
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy file upload!",
        });
      }
      const filePath = req.file.path;
      await importExam(filePath, req.user._id);
      // const { savedQuestions, savedPassages } = await importExam(
      //   filePath,
      //   req.user._id
      // );
      return res.status(200).json({
        success: true,
        message: "Đề thi đã được nhập thành công!",
        // data: { questions: savedQuestions, passages: savedPassages },
      });
    } catch (error) {
      console.error("Lỗi khi nhập đề thi:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi server! Không thể nhập đề thi.",
        error: error.message,
      });
    }
  });
};
