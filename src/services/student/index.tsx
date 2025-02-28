import { request } from "@/config/request";
import { Exam, Question } from "../teacher/Teacher";
export interface Result {
  _id?: string;
  examId: string | Exam;
  userId?: string;
  score: number;
  correctAnswer: number;
  wrongAnswer: number;
  questions: Question[];
  createdAt: Date;
  isDeleted: boolean;
}
export interface AnswerResult {
  _id: string;
  text: string;
  correctAnswerForBlank?: string;
  isCorrect: boolean;
}

export interface QuestionAnswerResult {
  _id: string;
  questionId: string;
  content: string;
  answers: AnswerResult[];
  selectedAnswerId: string;
  userAnswers: userAnswers[];
  isCorrect: boolean;
  
}
interface userAnswers {
  userAnswer: string,
  answerId: string,
  isCorrect: boolean,
  _id: string
}
export interface SubmitAnswer {
  examId: string;
  userId: string;
  answers: submitAnswer[];
}
export interface submitAnswer {
  questionId: string;
  selectedAnswerId?: string;
  userAnswer?: string[];
}
export const ResultAPI = {
  getAllResult: async (page: number) => {
    const response = await request.get(`/result/?page=${page}`);
    return response.data;
  },
  getDetailResult: async (id: string) => {
    const response = await request.get(`/result/${id}`);
    return response.data;
  },
  submitAnswer: async (data: SubmitAnswer) => {
    const response = await request.post(`/result/submit`, data);
    return response.data;
  },
  getWrongAnswers: async (id: string) => {
    const response = await request.get(`/result/wrong-questions/${id}`);
    return response.data;
  },
};
export const ExamAPIStudent = {
  getAllExam: async (page: number) => {
    const response = await request.get(`/exam/?page=${page}`);
    return response.data;
  },
  getAllExam1000: async (page: number) => {
    const response = await request.get(`/exam/?limit=1000&?page=${page}`);
    return response.data;
  },
  getDetailExam: async (slug: string) => {
    const response = await request.get(`/exam/detail/${slug}`);
    return response.data;
  },
  joinExam: async (id: string) => {
    const response = await request.get(`/exam/exam-practice/${id}`);
    return response.data;
  },
};
