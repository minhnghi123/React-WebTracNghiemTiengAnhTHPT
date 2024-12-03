import { Question } from "../../models/Question.model.js";
import { QuestionType } from "../../models/QuestionType.model.js";
import { Audio } from "../../models/Audio.model.js";

export const questionManagement = async (req, res) => {
  // //questionType
  const questionTypes = await QuestionType.find({ deleted: false });
  const receivedQuestionTypes = req.query.questionType;
  //pagination
  let currentPage = 1;
  if (req.query.page) {
    currentPage = parseInt(req.query.page);
  }
  const condition = {
    questionType: receivedQuestionTypes,
    deleted: false,
  };
  const totalItems = await Question.countDocuments({ deleted: false });
  let limitItems = 4;
  if (req.query.limit) {
    limitItems = parseInt(req.query.limit);
  }
  const skip = (currentPage - 1) * limitItems;
  const totalPage = Math.ceil(totalItems / limitItems);
  const questions = await Question.find(condition).limit(limitItems).skip(skip);

  const questionsWithAudioInfo = await Promise.all(
    questions.map(async (element) => {
      if (element.audio) {
        const infoAudio = await Audio.findById(element.audio);
        element = element.toObject();
        element.audioInfo = infoAudio;
      }
      return element;
    })
  );
  res.status(200).json({
    code: 200,
    message: "Get all questions successfully !",
    questions: questionsWithAudioInfo,
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
      message: "Question not found",
    });
  }
  res.status(200).json({
    code: 200,
    message: "Get question detail successfully",
    question: question,
  });
};

export const update = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(400).json({
        code: 400,
        message: "Question not found",
      });
    }
    res.status(200).json({
      code: 200,
      message: "Get question detail successfully",
      question: question,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Internal server error" });
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
    res.status(200).json({
      code: 200,
      message: "Created a new question",
      id: newQuestion._id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Internal server error" });
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
    res.status(200).json({
      code: 200,
      message: "Deleted question successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Internal server error" });
  }
};

export const updatePatch = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.audioInfo) {
      const existingAudio = await Audio.findById(updateData.audio);

      if (existingAudio && JSON.stringify(existingAudio) === JSON.stringify(req.body.audioInfo)) {
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

    res.status(200).json({
      code: 200,
      message: "Updated question successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ code: 400, message: "Internal server error" });
  }
};
