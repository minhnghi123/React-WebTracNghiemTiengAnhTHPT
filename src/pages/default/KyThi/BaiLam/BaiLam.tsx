import { ExamAPIStudent, ResultAPI, SubmitAnswer } from "@/services/student";
import { Question } from "@/services/teacher/Teacher";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionSumit from "./QuestionSumit";
import "./BaiLam.css";
import { Button } from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";

export const BaiLam = () => {
  const { _id } = useParams<{ _id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState<string>("");
  const [endTime, setEndTime] = useState<Date>();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const questionRefs = useRef<HTMLDivElement[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { user } = useAuthContext();

  const fetchJoinExam = async () => {
    let id = localStorage.getItem("_idExam") ?? "";
    if (!id || id === "undefined") {
      const fetchJoin = await ExamAPIStudent.joinExam(_id ?? "");
      if (fetchJoin.code === 200) {
        setQuestions(fetchJoin.questions);
        setTitle(fetchJoin.title);
        const newEndTime = new Date();
        newEndTime.setMinutes(newEndTime.getMinutes() + fetchJoin.duration);
        setEndTime(newEndTime);
        localStorage.setItem("_idExam", _id ?? "");
        localStorage.setItem("endTime", newEndTime.toString());
      }
    } else {
      const fetchJoin = await ExamAPIStudent.joinExam(id);
      if (fetchJoin.code === 200) {
        setQuestions(fetchJoin.questions);
        setTitle(fetchJoin.title);
        const now = new Date();
        now.setMinutes(now.getMinutes() + fetchJoin.duration);
        const newEndTime = localStorage.getItem("endTime")
          ? new Date(localStorage.getItem("endTime") ?? "")
          : now;
        setEndTime(newEndTime);
        localStorage.setItem("_idExam", id);
      }
    }
  };

  // Cập nhật thời gian còn lại ngay khi endTime được set
  useEffect(() => {
    if (endTime) {
      const updateRemaining = () => {
        const now = new Date();
        const timeLeft = Math.max(
          0,
          Math.floor((endTime.getTime() - now.getTime()) / 1000)
        );
        setRemainingTime(timeLeft);
        if (timeLeft <= 0 && !isSubmitted) {
          alert("Hết thời gian làm bài");
          handleQuestionSubmit();
        }
      };
      updateRemaining(); // Cập nhật ngay lúc đầu
      const interval = setInterval(updateRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [endTime, isSubmitted]);

  useEffect(() => {
    fetchJoinExam();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleQuestionClick = (index: number) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuestionSubmit = async () => {
    if (isSubmitted) {
      alert("Bạn đã nộp bài rồi");
      return;
    }
    const submitAnswer = {
      examId: localStorage.getItem("_idExam") ?? "",
      userId: user?._id ?? "",
      answers: JSON.parse(localStorage.getItem("answers") ?? "[]"),
    } as SubmitAnswer;
    console.log(submitAnswer);
    const response = await ResultAPI.submitAnswer(submitAnswer);
    if (response.code === 200) {
      alert("Nộp bài thành công");
      setIsSubmitted(true);
      localStorage.removeItem("endTime");
      localStorage.removeItem("_idExam");
      localStorage.removeItem("answers");
      setRemainingTime(0);
      setEndTime(undefined);
    }
  };

  return (
    <div>
      <center>
        <h1 className="text-2xl font-bold mb-4 ">{title}</h1>
      </center>
      <div className="containerKetQua mx-auto">
        <div className="question-column">
          {questions.map((question, index) => (
            <div key={index} ref={(el) => (questionRefs.current[index] = el!)}>
              <QuestionSumit
                question={question}
                questionType={question.questionType ?? ""}
              />
            </div>
          ))}
        </div>
        <div className="timer-column">
          <div className={`timer ${remainingTime <= 60 ? "critical" : ""}`}>
            Thời gian còn lại: {formatTime(remainingTime)}
            <hr />
            <Button onClick={handleQuestionSubmit} disabled={isSubmitted}>
              Nộp bài
            </Button>
          </div>
          <div className="question-nav">
            {questions.map((_, index) => (
              <button key={index} onClick={() => handleQuestionClick(index)}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
