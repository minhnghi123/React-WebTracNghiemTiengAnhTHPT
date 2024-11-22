import { Question } from "../../models/Question.model.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Convert questions data to Excel format
const convertToExcelData = async (questionsData) => {
  const data = [];
  questionsData.forEach((question) => {
    const row = {
      QuestionId: question.id,
      QuestionText: question.questionText,
      QuestionKnowledge: question.explanationData.knowledge,
      QuestionExplanation: question.explanationData.explanations,
      QuestionTranslation: question.explanationData.translation,
    };

    question.answers.forEach((answer) => {
      row[`Answer${answer.value}`] =
        answer.isCorrect == true ? answer.label + "*" : answer.label;
    });

    data.push(row);
  });
  return data;
};

//Read the file excel
const importQuestion = async (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  try {
    data.forEach(async (questionData) => {
      const {
        QuestionText: content,
        AnswerA,
        AnswerB,
        AnswerC,
        AnswerD,
        QuestionKnowledge: knowledge,
        QuestionTranslation: translation,
        QuestionExplanation: explanation,
      } = questionData;
      const answers = [AnswerA, AnswerB, AnswerC, AnswerD].map((answer) => ({
        text: answer.replace("*", "").trim(),
        isCorrect: answer.includes("*"),
      }));
      const newQuestion = new Question({
        content: content,
        answers: answers,
        knowledge: knowledge,
        translation: translation,
        explanation: explanation,
      });
      await newQuestion.save();
    });
    console.log("All questions have been saved successfully.");
  } catch (error) {
    console.log("Error saving question", error);
  }
};

export const questionPost = async (req, res) => {
  try {
    const questions = req.body.questionsData;
    let examTitle = req.body.examTitle;
    examTitle = examTitle.replace(/\[\d{4}-\d{4}\]/, "").trim();
    examTitle = examTitle.trim().split(/\s+/).join("-");
    // console.log(questions);
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        message: "No questions provided to save.",
      });
    }
    const excelData = await convertToExcelData(questions);
    // console.log(excelData);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Questions");

    const filePath = path.join("/backend", "excels", `${examTitle}.xlsx`);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    XLSX.writeFile(wb, filePath);
    console.log(`File has been saved to ${filePath}`);
    //read the excel file ,then save data to db
    importQuestion(filePath);
  } catch (error) {
    console.error("Error saving questions to Excel:", error);
    res.status(500).json({
      message: "An error occurred while saving questions to Excel.",
    });
  }
};
