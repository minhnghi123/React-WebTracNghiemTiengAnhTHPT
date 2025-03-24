import { request } from "@/config/request";
import { ExamDataRecieve } from "./ListeningQuestion";
export interface Answer {
  _id?: string;
  text?: string;
  correctAnswerForBlank?: string;
  isCorrect: boolean;
}
export interface Audio {
  _id?: string;
  filePath: string | File;
  description: string;
  transcription: string;
  createdAt?: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean;
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
  text?: string;
}
export interface Exam {
  _id?: string;
  title?: string;
  description?: string;
  questions: string[] | Question[];
  listeningExams: ExamDataRecieve[]; 
  duration: number;
  startTime: Date;
  endTime?: Date;
  isPublic: boolean;
  slug: string;
  createdAt: Date;
  updatedAt?: Date;
}
export interface ExamInfo {
  _id?: string;
  title?: string;
  description?: string;
  questions?: Question[];
  duration: number;
  startTime: Date;
  endTime?: Date;
  isPublic: boolean;
  slug: string;
  createdAt: Date;
}
export interface DetailExamType {
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
export interface QuestionType {
  _id?: string;
  name: string;
  description?: string;
  deleted: boolean;
}
export interface ExamCopy {
  examId: string;
}
export interface ExamResult {
  examId: string;
  userId: string;
  score: number;
  correctAnswer: number;
  wrongAnswer: number;
  details: QuestionDetail[];
  wrongAnswerByKnowledge: Record<string, number>;
  suggestionQuestion: SuggestionQuestion[];
  videos: Record<string, Video[]>;
  arrResponse: string;
}

export interface QuestionDetail {
  questionId: string;
  content: string;
  answers: Answer[];
  userAnswers: UserAnswer[];
  correctAnswerForBlank?: string[];
  audio?: string | null;
  isCorrect: boolean;
}



export interface UserAnswer {
  userAnswer: string | string[];
  answerId?: string | null;
  isCorrect: boolean;
}

export interface SuggestionQuestion {
  _id: string;
  content: string;
  thumbnail: string;
  videoId: string;
}

export interface Video {
  title: string;
  linkUrl: string;
  videoId: string;
  thumbnail: string;
}
export const QuestionAPI = {
  getAllQuestionsTotal: async (page: number) => {
    const response = await request.get(
      `teacher/question-management/?page=${page}`
    );
    return response.data;
  },
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
  createExam: async (question: Exam) => {
    const response = await request.post("/teacher/exam/create", question);
    return response.data;
  },
  getDetailExam: async (slug: string) => {
    const response = await request.get(`/teacher/exam/detail/${slug}`);
    return response.data;
  },
  UpdateExam: async (question: Exam, slug: string) => {
    const response = await request.patch(
      `/teacher/exam/update/${slug}`,
      question
    );
    return response.data;
  },
  copyExam: async (ExamCopy : ExamCopy) => {
    
    const response = await request.post(`/teacher/exam/copy-exam/`,ExamCopy);
    

    return response.data;
  }
  ,
  deleteExam: async (id: string) => {
    const response = await request.delete(`/teacher/exam/delete/${id}`);
    return response.data;
  },
  setScheduleExam: async (id: string, startTime: Date, endTime: Date) => {
    const response = await request.patch(`/teacher/exam/schedule/${id}`, {
      startTime,
      endTime,
    });
    return response.data;
  },
  createExamAuTo: async (
    level: string,
    numberOfQuestions: number,
    duration: number,
    questionTypes: string[]
  ) => {
    // console.log({
    //   level,
    //   numberOfQuestions,
    //   duration,
    //   questionTypes,
    // });
    const response = await request.post("/teacher/exam/auto-generate-exam", {
      level,
      numberOfQuestions,
      duration,
      questionTypes,
    });
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
export const AudioAPI = {
  getAllAudio: async () => {
    const response = await request.get(`/teacher/audio/`);
    return response.data;
  },
  createAudio: async (question: Audio) => {
    const response = await request.post("/teacher/audio/upload", question, {
      headers: {
        "Content-Type": "multipart/form-data", 
      },
    });
    return response.data;
  },
  updateAudio: async (question: Audio, _id: string) => {
    const response = await request.patch(
      `/teacher/audio/update/${_id}`,
      question
      , {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      } );
    return response.data;
  },
  deleteAudio: async (id: string) => {
    const response = await request.patch(`/teacher/audio/delete/${id}`);
    return response.data;
  },
};
