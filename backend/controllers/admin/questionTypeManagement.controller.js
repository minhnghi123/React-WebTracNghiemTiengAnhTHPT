import { QuestionType } from "../../models/QuestionType.model.js";

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
      message: "Get all question types successfully !",
      questionTypes: questionTypes,
      currentPage: currentPage,
      totalItems: totalItems,
      totalPage: totalPage,
      limitItems: limitItems,
      hasNextPage: currentPage < totalPage,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Internal server error !",
    });
  }
};
export const createPost = async (req, res) => {
  try {
    const newQuestionType = new QuestionType(req.body);
    newQuestionType.save();
    res.status(200).json({
      code: 200,
      message: "Create question type successfully !",
      questionType: newQuestionType,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Internal server error !",
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
      message: "Get question type successfully !",
      questionType: questionType,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Internal server error !",
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
      message: "Update question type successfully !",
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Internal server error !",
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
      message: "Delete question type successfully !",
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Internal server error !",
    });
  }
};

export const getAllQuestionTypes = async (req, res) => {
  try {
    const questionTypes = await QuestionType.find({ deleted: false });
    res.status(200).json({
      success: true,
      message: "Question types retrieved successfully",
      data: questionTypes,
    });
  } catch (error) {
    console.error("Error fetching question types:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching question types",
      error: error.message,
    });
  }
};
