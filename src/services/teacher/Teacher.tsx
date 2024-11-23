import { request } from "@/config/request";
export interface Answer {
  text: string;
  isCorrect: boolean;
  _id?: string;
}

export interface Question {
  _id?: string;
  content: string;
  level: "easy" | "medium" | "hard";
  answers: Answer[];
  subject: string;
  knowledge: string;
  translation: string;
  explanation: string;
  deleted?: boolean;
  createdAt?: Date;
}
export interface Exam {
  _id?: string;
  title: string;
  description?: string;
  questions: Question[];
  duration: number;
  startTime: Date;
  endTime?: Date;
  isPublic: boolean;
  slug: string;
  createdAt: Date;
}

export const QuestionAPI = {
  getAllQuestions: async (page: number) => {
    const response = await request.get(
      `teacher/question-management?page=${page}`
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
  creteQuestion: async (question: Question) => {
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
