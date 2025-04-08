import React, { useEffect, useRef, useState } from "react";
import { ResultAPI, SubmitAnswer } from "@/services/student";
import { ExamResult, QuestionAPI } from "@/services/teacher/Teacher";
import { Button, Card, Collapse, Spin } from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";
import { gemini } from "@/services/GoogleApi";

import "./BaiLam.css";
import QuestionSubmit from "./QuestionSumit";
import ListeningQuestionSubmit from "./listeningQuestionSubmit";
import ErrorReportModal from "@/components/ErrorReportModal"; // Import ErrorReportModal
import { ListeningQuestion, Question } from "@/types/interface";

const { Panel } = Collapse;

const BaiLam: React.FC = () => {
  const [examDetails, setExamDetails] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [Examresult, setExamresult] = useState<ExamResult>();
  const [suggestedQuestions, setSuggestedQuestions] = useState<Question[]>([]);
  const [advice, setAdvice] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<any[]>([]);
  const [errorReportVisible, setErrorReportVisible] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const fetchExamDetails = async () => {
    try {
      const response = await ResultAPI.getInCompletedExam();
      if (response.code === 200 && response.results) {
        const endTimeDate = new Date(response.results.endTime);
        setExamDetails(response.results);
        setSuggestedQuestions(response.results.suggestionQuestion || []);
        updateRemainingTime(endTimeDate);
      }
    } catch (error) {
      console.error("Error fetching exam details:", error);
    }
  };

  const updateRemainingTime = (endTimeDate: Date) => {
    const updateRemaining = () => {
      const now = new Date();
      const timeLeft = Math.max(0, Math.floor((endTimeDate.getTime() - now.getTime()) / 1000));
      setRemainingTime(timeLeft);
      if (timeLeft <= 0 && !Examresult) {
        alert("Hết thời gian làm bài");
        handleSubmit();
      }
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchExamDetails();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (newAnswer: any) => {
    setAnswers((prev: any[]) => {
      const existingIndex = prev.findIndex((ans) => ans.questionId === newAnswer.questionId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  const handleListeningAnswerChange = (newAnswer: any) => {
    setListeningAnswers((prev: any[]) => {
      const existingIndex = prev.findIndex((ans) => ans.questionId === newAnswer.questionId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  const handleSubmit = async () => {
    if (Examresult) {
      alert("Bạn đã nộp bài rồi");
      return;
    }
    if (!examDetails) return;
    const submitAnswer: SubmitAnswer = {
      resultId: examDetails._id,
      answers: answers,
      listeningAnswers: listeningAnswers,
    };
    console.log(submitAnswer);
    const response = await ResultAPI.submitAnswer(submitAnswer);
    if (response.code === 200) {
      alert("Nộp bài thành công");
      setExamresult(response);
      setSuggestedQuestions(response.suggestionQuestion);
      setRemainingTime(0);
      resultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openErrorReportModal = (question: Question | ListeningQuestion) => {
      setSelectedQuestion(question as Question);
      setErrorReportVisible(true);
    };

  const closeErrorReportModal = () => {
    setSelectedQuestion(null);
    setErrorReportVisible(false);
  };

  useEffect(() => {
    const fetchPostSubmitData = async () => {
      if (Examresult) {
        setLoading(true);
        const advResponse = await gemini(Examresult.arrResponse);
        setAdvice(advResponse);
        const updated: Question[] = [];
        for (const sug of suggestedQuestions) {
          if (sug._id) {
            const res = await QuestionAPI.getQuestion(sug._id);
            if (res.code === 200) {
              updated.push(res.question);
            }
          }
        }
        setSuggestedQuestions(updated);
        setLoading(false);
      }
    };
    fetchPostSubmitData();
  }, [Examresult]);

  return (
    <div>
      <center>
        <h1 className="text-2xl font-bold mb-4">{examDetails?.examId.title}</h1>
      </center>
      <div className="containerKetQua mx-auto">
        <div className="question-box">
          {examDetails?.examId.questions?.map((q: Question) => (
            <div key={q._id} className="mb-4">
              <QuestionSubmit
                question={q}
                questionType={q.questionType || ""}
                onAnswerChange={handleAnswerChange}
                currentAnswer={answers.find((ans) => ans.questionId === q._id)}
              />
              <Button
                type="link"
                danger
                onClick={() => openErrorReportModal(q)}
                style={{ marginTop: "8px" }}
              >
                Báo lỗi
              </Button>
            </div>
          ))}
        </div>
        {examDetails?.examId.listeningExams && examDetails.examId.listeningExams.length > 0 && (
          <div className="listening-box">
            {examDetails.examId.listeningExams.map((le: any) => (
              <div key={le._id} className="mb-6">
                <h2 className="section-title">{le.title}</h2>
                <p className="section-desc">{le.description}</p>
                <div className="audio-container">
                  <audio controls>
                    <source src={le.audio.filePath} type="audio/mpeg" />
                  </audio>
                </div>
                {le.questions && le.questions.map((q: ListeningQuestion) => (
                  <div key={q._id} className="mb-4">
                    <ListeningQuestionSubmit
                      question={q}
                      questionType={q.questionType || ""}
                      onAnswerChange={handleListeningAnswerChange}
                      currentAnswer={listeningAnswers.find((ans) => ans.questionId === q._id)}
                    />
                    <Button
                      type="link"
                      danger
                      onClick={() => openErrorReportModal(q 

                      )}
                      style={{ marginTop: "8px" }}
                    >
                      Báo lỗi
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="timer-column">
          <div className={`timer ${remainingTime <= 60 ? "critical" : ""}`}>
            Thời gian còn lại: {formatTime(remainingTime)}
            <hr />
            <Button onClick={handleSubmit} disabled={!!Examresult || loading}>
              Nộp bài
            </Button>
          </div>
          <div className="question-nav">
            {[
              ...(examDetails?.examId.questions || []),
              ...(examDetails?.examId.listeningExams?.flatMap((le: any) => le.questions || []) || [])
            ].map((_, index) => (
              <button
                key={index}
                onClick={() => questionRefs.current[index]?.scrollIntoView({ behavior: "smooth" })}
                disabled={loading}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedQuestion && errorReportVisible && (
        <ErrorReportModal
          questionId={selectedQuestion._id }
          examId={examDetails.examId._id}
          userId={examDetails.userId}
          onClose={closeErrorReportModal}
        />
      )}
      {Examresult && (
        <div className="container my-4" ref={resultSectionRef}>
          <Card className="shadow p-3">
            <center>
              <h3 className="text-primary">Kết quả của bạn</h3>
              <p>
                Điểm số:{" "}
                <strong>
                  {Examresult.correctAnswer} /{" "}
                  {Examresult.correctAnswer + Examresult.wrongAnswer}
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
                    <center>
                      <div className="loading-overlay">
                        <Spin size="large" />
                        Đang tạo lời khuyên...
                      </div>
                    </center>
                  ) : (
                    <p style={{ whiteSpace: "pre-line", fontSize: "1rem" }}>{advice}</p>
                  )}
                </Panel>
                <Panel header="Video liên quan" key="1">
                  {Examresult.videos &&
                    Object.keys(Examresult.videos).map((key) => (
                      <div key={key} className="mb-3">
                        <h5 className="text-success">{key}</h5>
                        <div className="list-group">
                          {Examresult.videos[key].map((video: any) => (
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
                    {suggestedQuestions && suggestedQuestions.length > 0 && (
                      <Collapse className="mt-3">
                        {suggestedQuestions.map((q: Question, id: number) => (
                          <Panel
                            header={`${id + 1}. ${
                              q.content.length > 200 ? q.content.slice(0, 200) + " ..." : q.content
                            }`}
                            key={q._id ?? id}
                          >
                            <QuestionSubmit
                              question={q}
                              questionType={q.questionType || ""}
                              onAnswerChange={() => {}}
                            />
                          </Panel>
                        ))}
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

export default BaiLam;
