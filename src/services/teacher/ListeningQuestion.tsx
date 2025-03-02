import { request } from "@/config/request";

interface ListeningQuestion {
  id: string;
  teacherId: string;
  questionText: string;
  questionType: string;
  options?: { option_id: string; optionText: string }[];
  correctAnswer?: { answer_id: string; answer: string }[];
  difficulty: "easy" | "medium" | "hard";
  isDeleted?: boolean;
  blankAnswer?: string;
}

interface ListeningExam {
  id: string;
  teacherId: string;
  examName: string;
  questions: ListeningQuestion[];
  difficulty: "easy" | "medium" | "hard";
  isDeleted?: boolean;
}

export const listenQuestionAPI = {
  getAllListeningQuestions: async (): Promise<ListeningQuestion[]> => {
    const response = await request.get("/teacher/listening-questions");
    return response.data;
  },
  getListeningQuestion: async (id: string): Promise<ListeningQuestion> => {
    const response = await request.get(`/teacher/listening-questions/${id}`);
    return response.data;
  },
  createListeningQuestion: async (data: ListeningQuestion): Promise<ListeningQuestion> => {
    const response = await request.post("/teacher/listening-questions", data);
    return response.data;
  },
  updateListeningQuestion: async (id: string, data: Partial<ListeningQuestion>): Promise<ListeningQuestion> => {
    const response = await request.patch(`/teacher/listening-questions/${id}`, data);
    return response.data;
  },
  deleteListeningQuestion: async (id: string): Promise<ListeningQuestion> => {
    const response = await request.patch(`/teacher/listening-questions/delete/${id}`);
    return response.data;
  },
};

export const ExamListeningQuestionAPI = {
  getAllListeningExams: async (): Promise<ListeningExam[]> => {
    const response = await request.get("/teacher/listening-exams");
    return response.data;
  },
  getListeningExam: async (id: string): Promise<ListeningExam> => {
    const response = await request.get(`/teacher/listening-exams/${id}`);
    return response.data;
  },
  createListeningExam: async (data: ListeningExam): Promise<ListeningExam> => {
    const response = await request.post("/teacher/listening-exams", data);
    return response.data;
  },
  updateListeningExam: async (id: string, data: Partial<ListeningExam>): Promise<ListeningExam> => {
    const response = await request.patch(`/teacher/listening-exams/${id}`, data);
    return response.data;
  },
  deleteListeningExam: async (id: string): Promise<ListeningExam> => {
    const response = await request.patch(`/teacher/listening-exams/delete/${id}`);
    return response.data;
  },
};
