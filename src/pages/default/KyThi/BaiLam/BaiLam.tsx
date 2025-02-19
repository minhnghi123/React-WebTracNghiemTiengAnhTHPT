import { ExamAPIStudent, ResultAPI, SubmitAnswer } from "@/services/student";
import { ExamResult, Question, QuestionAPI } from "@/services/teacher/Teacher";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionSumit from "./QuestionSumit";
import "./BaiLam.css";
import { Button, Card, Collapse, Spin } from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import QuestionComponent from "@/pages/giaovien/QuanLyCauHoi/Question";
import { gemini } from "@/services/GoogleApi";

export const BaiLam = () => {
  const { Panel } = Collapse;
  const { _id } = useParams<{ _id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState<string>("");
  const [endTime, setEndTime] = useState<Date>();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const questionRefs = useRef<HTMLDivElement[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { user } = useAuthContext();
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
  const [Examresult, setExamresult] = useState<ExamResult>();
  const [listSugesstedQuestion, setListSugesstedQuestion] = useState<
    Question[]
  >([]);
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
    const response = await ResultAPI.submitAnswer(submitAnswer);
    if (response.code === 200) {
      alert("Nộp bài thành công");
      setExamresult(response);
      
      setListSugesstedQuestion(response.suggestionQuestion);
      setIsSubmitted(true);
      localStorage.removeItem("endTime");
      localStorage.removeItem("_idExam");
      localStorage.removeItem("answers");
      setRemainingTime(0);
      setEndTime(undefined);
      resultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      const updatedQuestions: Question[] = [];
      for (const suggestion of listSugesstedQuestion) {
        if (suggestion._id) {
          const question = await QuestionAPI.getQuestion(suggestion._id);
          if (question.code === 200) {
            updatedQuestions.push(question.question);
          }
        }
      }
      setListSugesstedQuestion(updatedQuestions);
    };
    const fetchAdvice = async () => {
      setLoading(true);
      if (Examresult) {
        const response = await gemini(Examresult.arrResponse);
        setAdvice(response);
      }
      setLoading(false);
    }
    if (isSubmitted) {
      fetchSuggestedQuestions();
      fetchAdvice();
    }

    
  }, [isSubmitted]);

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [advice,setAdvice] = useState<string>("");
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
            <Button onClick={handleQuestionSubmit} disabled={isSubmitted || loading}>
              Nộp bài
            </Button>
          </div>
          <div className="question-nav">
            {questions.map((_, index) => (
              <button key={index} onClick={() => handleQuestionClick(index)} disabled={loading}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      {Examresult && (
        <div className="container my-4" ref={resultSectionRef}>
          <Card className="shadow p-3">
            <center>
              <h3 className="text-primary">Kết quả của bạn</h3>
              <p>
                Điểm số:{" "}
                <strong>
                  {Examresult.correctAnswer} /{" "}
                  {Examresult.wrongAnswer + Examresult.correctAnswer}
                </strong>
              </p>
            </center>
            <Button type="primary" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
            </Button>

            {showDetails && (
              <Collapse className="mt-3" defaultActiveKey={["1"]}>
                <Panel header="Lời khuyên" key="3">
                {loading ? (
      <center>  <div className="loading-overlay">
          <Spin size="large" />
          Đang tạo lời khuyên
        </div>
        </center>
      ):   <p style={{ whiteSpace: "pre-line" , fontSize: "1rem"}}>{advice}</p>}
                
                  
                </Panel>
                <Panel header="Video liên quan" key="1">
                  {Object.keys(Examresult.videos).map((key) => (
                    <div key={key} className="mb-3">
                      <h5 className="text-success">{key}</h5>
                      <div className="list-group">
                        {Examresult.videos[key].map((video) => (
                          <a
                            key={video.videoId}
                            href={video.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="list-group-item list-group-item-action"
                          >
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="img-fluid rounded mb-2"
                              style={{ maxWidth: "120px" }}
                            />
                            <p className="mb-0">{video.title}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </Panel>

                <Panel header="Câu hỏi đề nghị" key="2">
                  <ul className="list-group">
                    {listSugesstedQuestion &&
                      listSugesstedQuestion.length > 0 && (
                        <Collapse className="mt-3">
                          {listSugesstedQuestion.map(
                            (question: Question, id) => (
                              <Panel
                                header={`${id + 1}. ${question.content.length > 200 
                                  ? question.content.slice(0, 200) + " ..." 
                                  : question.content}`}
                                key={question._id ?? id}
                              >
                                <QuestionComponent
                                  editable={false}
                                  question={question}
                                  onUpdateSuccess={() => {}}
                                  questionType={question.questionType ?? ""}
                                />
                              </Panel>
                            )
                          )}
                        </Collapse>
                      )}
                  </ul>
                </Panel>
              </Collapse>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
