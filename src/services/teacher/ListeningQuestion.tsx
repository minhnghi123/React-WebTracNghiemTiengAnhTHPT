import { request } from "@/config/request";
import { Audio } from "./Teacher";
import { Answer } from "@/types/interface";
import { useAuthContext } from "@/contexts/AuthProvider";

export interface ListeningQuestion {
  id?: string;
  teacherId: string;
  questionText: string;
  questionType: string;
  options?: { option_id: string; optionText: string }[] ;
  answers?: Answer[];
  correctAnswer?: { answer_id: string; answer: string }[];
  difficulty: "easy" | "medium" | "hard";
  isDeleted?: boolean;
  blankAnswer?: string;
}
export interface ListeningQuestionData {
  id?: string;
  teacherId: string;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer?: number[];
  difficulty: "easy" | "medium" | "hard";
  isDeleted?: boolean;
  // Với dạng fill in the blank
  blankAnswer?: string;
}


export interface ListeningExamData {
  id?: string;
  teacherId: string; // ID của giáo viên
  title: string; // Tiêu đề bài kiểm tra
  description: string; // Mô tả bài kiểm tra
  audio: string; // ID của audio
  questions: string[]; // Mảng các ID câu hỏi
  duration?: number; // Thời lượng bài kiểm tra (mặc định: 90 phút)
  startTime?: Date; // Thời gian bắt đầu
  endTime?: Date; // Thời gian kết thúc
  isPublic?: boolean; // Trạng thái công khai (mặc định: false)
  isDeleted?: boolean; // Trạng thái xóa mềm
}



export interface Teacher {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  role: string;
  __v: number;
  deleted: boolean;
  status: string;
}

export interface Option {
  option_id: string;
  optionText: string;
  _id: string;
}

export interface CorrectAnswer {
  answer_id: string;
  answer: string;
  _id: string;
}

export interface Question {
  _id: string;
  teacherId: string;
  questionText: string;
  questionType: string;
  options: Option[];
  correctAnswer: CorrectAnswer[];
  difficulty: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ExamDataRecieve {
  _id: string;
  teacherId: Teacher;
  title: string;
  description: string;
  audio: Audio;
  questions: Question[];
  duration: number;
  difficulty: string;
  passingScore: number;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const listenQuestionAPI = {
  getAllListeningQuestions: async () => {
    const response = await request.get("/teacher/listening-question");
    return response.data;
  },
  getListeningQuestion: async (id: string) => {
    const response = await request.get(`/teacher/listening-question/${id}`);
    return response.data;
  },
  createListeningQuestion: async (data: ListeningQuestionData)=> {
    const response = await request.post("/teacher/listening-question/create", data);
    return response.data;
  },
  createMultiListeningQuestion: async (data: ListeningQuestionData) => {
    const response = await request.post("/teacher/listening-question/create-multi", data);
    return response.data;
  },
  updateListeningQuestion: async (id: string, data: Partial<ListeningQuestionData>) => {
    const response = await request.patch(`/teacher/listening-question/update/${id}`, data);
    return response.data;
  },
  deleteListeningQuestion: async (id: string) => {
    const response = await request.patch(`/teacher/listening-question/delete/${id}`);
    return response.data;
  },
};

export const ExamListeningQuestionAPI = {
  getAllListeningExams: async () => {
    const response = await request.get("/teacher/listening-exam");
    return response.data;
  },
  getListeningExamMySelf: async () => {
    const response = await request.get(`/teacher/listening-exam/my-self`);
    return response.data;
  },
  createListeningExam: async (data: Partial<ListeningExamData>) => {
    // Chỉ gửi các trường cần thiết theo cấu trúc mới
    const payload = {
      teacherId: data.teacherId,
      title: data.title,
      description: data.description,
      audio: data.audio,
      questions: data.questions,
      duration: data.duration || 90,
      startTime: data.startTime,
      endTime: data.endTime,
      isPublic: data.isPublic || false,
    };

    const response = await request.post("/teacher/listening-exam/create", payload);
    return response.data;
  },
  updateListeningExam: async (id: string,teacherId, data: Partial<ListeningExamData>) => {
    // Chỉ gửi các trường cần thiết theo cấu trúc mới
    const payload = {
      title: data.title,
      description: data.description,
      audio: data.audio,
      questions: data.questions,
      duration: data.duration,
      startTime: data.startTime,
      endTime: data.endTime,
      isPublic: data.isPublic,
      teacherId: teacherId,
    };

    const response = await request.patch(`/teacher/listening-exam/update/${id}`, payload);
    return response.data;
  },
  deleteListeningExam: async (id: string,teacherId: string) => {
    const response = await request.patch(`/teacher/listening-exam/delete/${id}`,teacherId);
    ;
    return response.data;
  },
};
