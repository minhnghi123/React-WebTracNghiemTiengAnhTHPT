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

export const Teacher = {
  getAllQuestions: async (page: number) => {
    const response = await request.get(
      `teacher/question-management?page=${page}`
    );

    return response.data;
  },
  creteQuestion: async (question: Question) => {
    const response = await request.post("/teacher/question/create", question);

    return response.data;
  },
};
