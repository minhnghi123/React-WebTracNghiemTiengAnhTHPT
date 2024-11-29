import { request } from "@/config/request";
export interface Answer {
  _id?: string;
  text: string;
  correctAnswerForBlank?: string;
  isCorrect: boolean;
}
export interface Audio {
  _id?: string;
  filePath: string;
  description: string;
  transcription: string;
  createdAt: Date;
  deletedAt?: Date | null;
  isDeleted: boolean;
}
export interface Question {
  _id?: string;
  content: string;
  level: "easy" | "medium" | "hard";
  questionType?: string;
  sourceType?: string;
  passageId?: string;
  answers: Answer[];
  subject: string;
  knowledge: string;
  translation: string;
  explanation: string;
  audio?: string;
  deleted?: boolean;
  createdAt?: Date;
  audioInfo?: Audio;
}
export interface Exam {
  _id?: string;
  title: string;
  description?: string;
  questions: string[];
  duration: number;
  startTime: Date;
  endTime?: Date;
  isPublic: boolean;
  slug: string;
  createdAt: Date;
}
export interface QuestionType {
  _id?: string;
  name: string;
  description?: string;
  deleted: boolean;
}
export const QuestionAPI = {
  getAllQuestions: async (page: number) => {
    const response = await request.get(
      `teacher/question-management?questionType=6742fb1cd56a2e75dbd817ea&page=${page}`
    );
    return response.data;
  },
  getAllQuestionsBlank: async (page: number) => {
    const response = await request.get(
      `teacher/question-management?questionType=6742fb3bd56a2e75dbd817ec&page=${page}`
    );
    return response.data;
  },
  getAllQuestionsSpecial: async (page: number) => {
    const response = await request.get(
      `teacher/question-management?questionType=6742fb5dd56a2e75dbd817ee&page=${page}`
    );
    return response.data;
  },
  createQuestion: async (question: Question) => {
    const response = await request.post("/teacher/question/create", question);
    return response.data;
  },
  getQuestion: async (id: string) => {
    const response = await request.get(`/teacher/question/detail/${id}`);
    return response.data;
  },
  UpdateQuestion: async (question: Question, _id: string) => {
    const response = await request.patch(
      `/teacher/question/update/${_id}`,
      question
    );
    return response.data;
  },
  deleteQuestion: async (id: string) => {
    const response = await request.patch(`/teacher/question/delete/${id}`);
    return response.data;
  },
};
export const ExamAPI = {
  getAllExam: async (page: number) => {
    const response = await request.get(`/teacher/exam?page=${page}`);
    return response.data;
  },
  changePublic: async (id: string) => {
    const response = await request.patch(
      `/teacher/exam/toggle-visibility/${id}`
    );
    return response.data;
  },
  creteExam: async (question: Exam) => {
    const response = await request.post("/teacher/exam/create", question);
    return response.data;
  },
  getQuestion: async (id: string) => {
    const response = await request.get(`/teacher/question/detail/${id}`);
    return response.data;
  },
  UpdateQuestion: async (question: Question, _id: string) => {
    const response = await request.patch(
      `/teacher/question/update/${_id}`,
      question
    );
    return response.data;
  },
  deleteQuestion: async (id: string) => {
    const response = await request.patch(`/teacher/question/delete/${id}`);
    return response.data;
  },
};
export const QuestionTypeAPI = {
  getAllQuestionType: async (page: number) => {
    const response = await request.get(`/teacher/question-types?page=${page}`);
    return response.data;
  },
  createQuestionType: async (question: QuestionType) => {
    const response = await request.post(
      "/teacher/question-types/create",
      question
    );
    return response.data;
  },
  getQuestionType: async (id: string) => {
    const response = await request.get(`/teacher/question-types/update/${id}`);
    return response.data;
  },
  UpdateQuestionType: async (question: QuestionType, _id: string) => {
    const response = await request.patch(
      `/teacher/question-types/update/${_id}`,
      question
    );
    return response.data;
  },
  deleteQuestionType: async (id: string) => {
    const response = await request.patch(
      `/teacher/question-types/delete/${id}`
    );
    return response.data;
  },
};
