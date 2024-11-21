import { Question } from "../../models/Question.model.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Convert questions data to Excel format
const convertToExcelData = (questionsData) => {
  const data = [];
  questionsData.forEach((question) => {
    const row = {
      QuestionId: question.questionId,
      QuestionNumber: question.questionNumber,
      QuestionText: question.questionText,
    };

    question.answers.forEach((answer) => {
      row[`Answer${answer.answerValue}`] = answer.answerLabel;
    });

    data.push(row);
  });
  return data;
};

export const questionPost = async (req, res) => {
  try {
    const questions = req.body;
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        message: "No questions provided to save.",
      });
    }
    const excelData = convertToExcelData(questions);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    const filePath = path.join("..", "excels", "questionsData.xlsx");
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    XLSX.writeFile(wb, filePath);
    console.log(`File has been saved to ${filePath}`);
    res.json({
      message: "Questions have been successfully saved to an Excel file",
      filePath,
    });
  } catch (error) {
    console.error("Error saving questions to Excel:", error);
    res.status(500).json({
      message: "An error occurred while saving questions to Excel.",
    });
  }
};
