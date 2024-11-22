import { Question } from "../../models/Question.model.js";
export const questionManagement = async (req, res) => {
  //pagination
  let currentPage = 1;
  if (req.query.page) {
    currentPage = parseInt(req.query.page);
  }
  const condition = {
    deleted: false,
  };
  const totalItems = await Question.countDocuments({ deleted: false });
  const limitItems = 4;
  if (req.query.limit) {
    limitItems = parseInt(req.query.limit);
  }
  const skip = (currentPage - 1) * limitItems;
  const totalPage = Math.ceil(totalItems / limitItems);
  const questions = await Question.find(condition).limit(limitItems).skip(skip);

  res.status(200).json({
    code: 200,
    message: "Get all questions successfully !",
    questions: questions,
    currentPage: currentPage,
    totalItems: totalItems,
    totalPage: totalPage,
    limitItems: limitItems,
    hasNextPage: currentPage < totalPage,
  });
};
