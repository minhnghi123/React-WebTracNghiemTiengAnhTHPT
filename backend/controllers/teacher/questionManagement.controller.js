import { Question } from "../../models/Question.model.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Audio } from "../../models/Audio.model.js";
import { Passage } from "../../models/Passage.model.js";
import XLSX from "xlsx";
import fs from "fs";
import { userLog } from "../../utils/logUser.js";

export const questionManagement = async (req, res) => {
  // //questionType
  const questionTypes = await QuestionType.find({ deleted: false });
  const receivedQuestionTypes = req.query.questionType || { $exists: true };
  //pagination
  let currentPage = 1;
  if (req.query.page) {
    currentPage = parseInt(req.query.page);
  }
  const condition = {
    questionType: receivedQuestionTypes,
    deleted: false,
  };
  const totalItems = await Question.countDocuments(condition);
  let limitItems = 4;
  if (req.query.limit) {
    limitItems = parseInt(req.query.limit);
  }
  const skip = (currentPage - 1) * limitItems;
  const totalPage = Math.ceil(totalItems / limitItems);
  const questions = await Question.find(condition)
    .limit(limitItems)
    .skip(skip)
    .populate("passageId"); // Populate the passageId field with the corresponding Passage document

  const questionsWithDetails = await Promise.all(
    questions.map(async (element) => {
      element = element.toObject();

      // Include audio info if available
      if (element.audio) {
        const infoAudio = await Audio.findById(element.audio);
        element.audioInfo = infoAudio;
      }

      // Include passage info if passageId exists
      // if (element.passageId) {
      //   const passage = await Passage.findById(element.passageId);
      //   element.passage = passage;
      // }

      return element;
    })
  );

  userLog(req, "Fetch Questions", "Fetched questions with pagination and filters.");

  res.status(200).json({
    code: 200,
    message: "Lấy danh sách câu hỏi thành công!",
    questions: questionsWithDetails,
    questionTypes: questionTypes,
    currentPage: currentPage,
    totalItems: totalItems,
    totalPage: totalPage,
    limitItems: limitItems,
    hasNextPage: currentPage < totalPage,
  });
};

export const detail = async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(400).json({
      code: 400,
      message: "Không tìm thấy câu hỏi",
    });
  }

  let passage = null;
  if (question.passage) {
    passage = await Passage.findById(question.passageId); 
  }

  userLog(req, "Fetch Question Detail", `Fetched details for question ID: ${req.params.id}`);

  res.status(200).json({
    code: 200,
    message: "Lấy chi tiết câu hỏi thành công",
    question: question,
    passage: passage, // Bao gồm nội dung đoạn văn
  });
};

export const update = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(400).json({
        code: 400,
        message: "Không tìm thấy câu hỏi",
      });
    }

    userLog(req, "Fetch Question for Update", `Fetched question for update with ID: ${req.params.id}`);

    res.status(200).json({
      code: 200,
      message: "Lấy chi tiết câu hỏi thành công",
      question: question,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};

export const createPost = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    if (req.body.audio) {
      const newAudio = new Audio(req.body.audio);
      await newAudio.save();
      newQuestion.audio = newAudio._id;
    }
    await newQuestion.save();

    userLog(req, "Create Question", "Created a new question.");

    res.status(200).json({
      code: 200,
      message: "Tạo câu hỏi mới thành công",
      id: newQuestion._id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};

export const deletePatch = async (req, res) => {
  try {
    await Question.updateOne(
      {
        _id: req.params.id,
      },
      {
        deleted: true,
      }
    );

    userLog(req, "Delete Question", `Soft deleted question with ID: ${req.params.id}`);

    res.status(200).json({
      code: 200,
      message: "Xóa câu hỏi thành công",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};

export const updatePatch = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.audioInfo) {
      const existingAudio = await Audio.findById(updateData.audio);

      if (
        existingAudio &&
        JSON.stringify(existingAudio) === JSON.stringify(req.body.audioInfo)
      ) {
        // If the new audioInfo is the same as the existing one, keep the existing _id
        updateData.audio = existingAudio._id;
      } else {
        // If the new audioInfo is different, create a new Audio document
        const newAudio = new Audio(req.body.audioInfo);
        await newAudio.save();
        updateData.audio = newAudio._id;
      }
    }

    await Question.updateOne(
      {
        _id: req.params.id,
      },
      updateData
    );

    userLog(req, "Update Question", `Updated question with ID: ${req.params.id}`);

    res.status(200).json({
      code: 200,
      message: "Cập nhật câu hỏi thành công",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ nội bộ" });
  }
};

export const importExcel = async (req, res) => {
  try {
    const { excel } = req.files;

    if (
      excel.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fs.unlink(excel.tempFilePath);
      return res.status(400).json({ msg: "Tệp không hợp lệ" });
    }
    //get all question Type
    const questionTypes = await QuestionType.find({ deleted: false });
    //get each question type
    const questionTypeMap = {};
    for (const questionType of questionTypes) {
      questionTypeMap[questionType.name] = questionType._id;
    }
    // Đọc và xử lý tệp Excel
    const workbook = XLSX.readFile(excel.tempFilePath);
    const sheetNames = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    let collectQuestions = [];
    for (const question of data) {
      let mockData = {};
      const { correctAnswerForBlank, CorrectAnswer } = question;
      if (correctAnswerForBlank) {
        //=> Fill in the Blanks
        mockData = {
          content: question.QuestionText,
          questionType: questionTypeMap["Fill in the Blanks"],
          level: question.Level.toLowerCase(),
          Knowledge: question.Knowledge,
          translation: question.Translation,
          answers: [
            {
              text: "",
              correctAnswerForBlank: correctAnswerForBlank,
            },
          ],
        };
      } else {
        //=> Multiple Choice Questions
        mockData = {
          content: question.QuestionText,
          questionType: questionTypeMap["Multiple Choice Questions"],
          level: question.Level.toLowerCase(),
          Knowledge: question.Knowledge,
          translation: question.Translation,
          answers: [
            {
              text: question.AnswerA,
              isCorrect: question.CorrectAnswer === "A",
            },
            {
              text: question.AnswerB,
              isCorrect: question.CorrectAnswer === "B",
            },
            {
              text: question.AnswerC,
              isCorrect: question.CorrectAnswer === "C",
            },
            {
              text: question.AnswerD,
              isCorrect: question.CorrectAnswer === "D",
            },
          ],
        };
      }
      collectQuestions.push(mockData);
    }

    // Save to database
    await Question.insertMany(
      collectQuestions,
      { ordered: false } // If any error occurs, stop inserting and return the error
    );

    userLog(req, "Import Questions from Excel", "Imported questions from an Excel file.");

    // Xóa tệp tạm thời
    fs.unlink(excel.tempFilePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    return res.status(200).json({
      msg: "Xử lý tệp Excel thành công",
      data: collectQuestions,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
  }
};
