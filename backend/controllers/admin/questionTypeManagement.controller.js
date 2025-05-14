import { QuestionType } from "../../models/QuestionType.model.js";
import { userLog } from "../../utils/logUser.js";

export const index = async (req, res) => {
  try {
    //pagination
    let currentPage = 1;
    if (req.query.page) {
      currentPage = parseInt(req.query.page);
    }
    const condition = {
      deleted: false,
    };
    const totalItems = await QuestionType.countDocuments({ deleted: false });
    const limitItems = 4;
    if (req.query.limit) {
      limitItems = parseInt(req.query.limit);
    }
    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);
    const questionTypes = await QuestionType.find(condition)
      .limit(limitItems)
      .skip(skip);

    res.status(200).json({
      code: 200,
      message: "Lấy tất cả các loại câu hỏi thành công!",
      questionTypes: questionTypes,
      currentPage: currentPage,
      totalItems: totalItems,
      totalPage: totalPage,
      limitItems: limitItems,
      hasNextPage: currentPage < totalPage,
    });
    userLog(
      req,
      "Fetch Question Types",
      "Fetched all question types with pagination."
    );
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const newQuestionType = new QuestionType(req.body);
    newQuestionType.save();
    res.status(200).json({
      code: 200,
      message: "Tạo loại câu hỏi thành công!",
      questionType: newQuestionType,
    });
    userLog(
      req,
      "Create Question Type",
      `Created a new question type: ${newQuestionType.name}`
    );
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

export const update = async (req, res) => {
  try {
    const questionType = await QuestionType.findOne({
      _id: req.params.id,
    });
    res.status(200).json({
      code: 200,
      message: "Lấy loại câu hỏi thành công!",
      questionType: questionType,
    });
    userLog(
      req,
      "Fetch Question Type",
      `Fetched question type with ID: ${req.params.id}`
    );
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

export const updatePatch = async (req, res) => {
  try {
    await QuestionType.updateOne(
      {
        _id: req.params.id,
      },
      req.body
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật loại câu hỏi thành công!",
    });
    userLog(
      req,
      "Update Question Type",
      `Updated question type with ID: ${req.params.id}`
    );
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

export const deletePatch = async (req, res) => {
  try {
    await QuestionType.updateOne(
      {
        _id: req.params.id,
      },
      {
        deleted: true,
      }
    );
    res.status(200).json({
      code: 200,
      message: "Xóa loại câu hỏi thành công!",
    });
    userLog(
      req,
      "Delete Question Type",
      `Marked question type as deleted with ID: ${req.params.id}`
    );
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

export const getAllQuestionTypes = async (req, res) => {
  try {
    const questionTypes = await QuestionType.find({ deleted: false });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách loại câu hỏi thành công!",
      data: questionTypes,
    });
    userLog(req, "Fetch All Question Types", "Fetched all question types.");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại câu hỏi:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách loại câu hỏi",
      error: error.message,
    });
  }
};
