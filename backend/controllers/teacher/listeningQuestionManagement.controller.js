import ListeningQuestion from "../../models/ListeningQuestion.js";
import mongoose from "mongoose";

export const getAllListeningQuestionsController = async (req, res) => {
  try {
    const questions = await ListeningQuestion.find({ isDeleted: false })
      .populate("teacherId")
      .populate("questionType");

    return res.status(200).json({
      message: "Danh sách câu hỏi",
      data: questions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);

    return res.status(500).json({
      message: "Không thể lấy câu hỏi. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const getListeningQuestionController = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await ListeningQuestion.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("teacherId")
      .populate("questionType");

    return res.status(200).json({
      message: "Câu hỏi tìm thấy!",
      data: question,
    });
  } catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);

    return res.status(500).json({
      message: "Không thể lấy câu hỏi. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const createListeningQuestion = async (req, res) => {
  try {
    const data = req.body;
    let newQuestion;
    if (data.questionType == "6742fb3bd56a2e75dbd817ec") {
      const newQuestionFillTheBlank = new ListeningQuestion({
        teacherId: data.teacherId,
        questionText: data.questionText,
        questionType: data.questionType,
        difficulty: data.difficulty,
        blankAnswer: data.blankAnswer,
      });
      newQuestion = newQuestionFillTheBlank

    } else {
      const options = data.options.map((optionText, index) => ({
        option_id: new mongoose.Types.ObjectId(),
        optionText,
      }));

      const correctAnswer = data.correctAnswer.map((index) => ({
        answer_id: options[index].option_id,
        answer: options[index].optionText,
      }));

      const newRestingQuestion = new ListeningQuestion({
        teacherId: data.teacherId,
        questionText: data.questionText,
        questionType: data.questionType,
        options,
        correctAnswer,
        difficulty: data.difficulty,
      });
      newQuestion = newRestingQuestion
    }

    await newQuestion.save();

    // Trả về câu hỏi mới tạo
    return res.status(201).json({
      message: "Câu hỏi đã được tạo thành công!",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Lỗi khi tạo câu hỏi:", error);
    return res.status(500).json({
      message: "Không thể tạo câu hỏi. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const updateListeningQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const options =
      data.options?.map((optionText) => ({
        option_id: new mongoose.Types.ObjectId(),
        optionText,
      })) || [];

    const correctAnswer =
      data.correctAnswer?.map((index) => ({
        answer_id: options[index]?.option_id,
        answer: options[index]?.optionText,
      })) || [];

    const updatedQuestion = await ListeningQuestion.findByIdAndUpdate(
      id,
      {
        ...data,
        options,
        correctAnswer,
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res
        .status(404)
        .json({ message: `Không tìm thấy câu hỏi với ID ${id}` });
    }

    return res.status(200).json({
      message: "Cập nhật câu hỏi thành công!",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật câu hỏi:", error);
    return res.status(500).json({
      message: "Không thể cập nhật câu hỏi. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const createMultipleListeningQuestions = async (req, res) => {
  try {
    const questions = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Không có câu hỏi nào để tạo!",
      });
    }

    const createdQuestions = [];

    for (const questionData of questions) {
      const {
        teacherId,
        questionText,
        questionType,
        options,
        correctAnswer,
        difficulty,
      } = questionData;

      const formattedOptions = options.map((optionText) => ({
        option_id: new mongoose.Types.ObjectId(),
        optionText,
      }));

      const formattedCorrectAnswer = correctAnswer.map((index) => ({
        answer_id: formattedOptions[index].option_id,
        answer: formattedOptions[index].optionText,
      }));

      const newQuestion = new ListeningQuestion({
        teacherId,
        questionText,
        questionType,
        options: formattedOptions,
        correctAnswer: formattedCorrectAnswer,
        difficulty,
      });

      await newQuestion.save();
      createdQuestions.push(newQuestion);
    }

    return res.status(201).json({
      message: "Tạo nhiều câu hỏi thành công!",
      data: createdQuestions,
    });
  } catch (error) {
    console.error("Lỗi khi tạo nhiều câu hỏi:", error);
    return res.status(500).json({
      message: "Không thể tạo câu hỏi. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const deleteListeningQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuestion = await ListeningQuestion.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedQuestion) {
      return res
        .status(404)
        .json({ message: `Không tìm thấy câu hỏi với ID ${id}` });
    }

    return res.status(200).json({
      message: "Câu hỏi đã được xóa thành công!",
      data: deletedQuestion,
    });
  } catch (error) {
    console.error("Lỗi khi xóa câu hỏi:", error);
    return res.status(500).json({
      message: "Không thể xóa câu hỏi. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};
