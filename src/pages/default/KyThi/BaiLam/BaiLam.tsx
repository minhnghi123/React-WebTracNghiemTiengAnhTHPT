import React, { useEffect, useRef, useState } from "react";
import { ResultAPI, SubmitAnswer } from "@/services/student";
import { ExamResult, QuestionAPI } from "@/services/teacher/Teacher";
import {
  Button,
  Card,
  Collapse,
  Spin,
  Layout,
  Typography,
  Row,
  Col,
  Affix,
  Divider,
} from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";
import { gemini } from "@/services/GoogleApi";
import QuestionSubmit from "./QuestionSumit";
import ListeningQuestionSubmit from "./listeningQuestionSubmit";
import { ListeningQuestion, Question } from "@/types/interface";

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;
const { Sider, Content } = Layout;

const BaiLam: React.FC = () => {
  const [examDetails, setExamDetails] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [Examresult, setExamresult] = useState<ExamResult>();
  const [suggestedQuestions, setSuggestedQuestions] = useState<Question[]>([]);
  const [advice, setAdvice] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<any[]>([]);
  const questionRefs = useRef<any[]>([]);
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await ResultAPI.getInCompletedExam();
        if (response.code === 200 && response.results) {
          setExamDetails(response.results);
          setSuggestedQuestions(response.results.suggestionQuestion || []);
          const endTime = new Date(response.results.endTime);
          endTimeRef.current = endTime;
        }
      } catch (error) {
        console.error("Error fetching exam details:", error);
      }
    };

    fetchExamDetails();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const tick = () => {
      if (!endTimeRef.current || Examresult) return;

      const now = new Date();
      const timeLeft = Math.max(
        0,
        Math.floor((endTimeRef.current.getTime() - now.getTime()) / 1000)
      );
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        alert("Hết thời gian làm bài");
        handleSubmit();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [Examresult]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (newAnswer: any) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (a) => a.questionId === newAnswer.questionId
      );
      if (index !== -1) updated[index] = newAnswer;
      else updated.push(newAnswer);
      return updated;
    });
  };

  const handleListeningAnswerChange = (newAnswer: any) => {
    setListeningAnswers((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (a) => a.questionId === newAnswer.questionId
      );
      if (index !== -1) updated[index] = newAnswer;
      else updated.push(newAnswer);
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (Examresult) {
      alert("Bạn đã nộp bài rồi");
      return;
    }
    if (!examDetails) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    const submitAnswer: SubmitAnswer = {
      resultId: examDetails._id,
      answers,
      listeningAnswers,
    };
    const response = await ResultAPI.submitAnswer(submitAnswer);
    if (response.code === 200) {
      alert("Nộp bài thành công");
      setExamresult(response);
      setSuggestedQuestions(response.suggestionQuestion);
      setRemainingTime(0);
      resultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
            if (res.code === 200) updated.push(res.question);
          }
        }

        setSuggestedQuestions(updated);
        setLoading(false);
      }
    };

    fetchPostSubmitData();
  }, [Examresult]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
          {examDetails?.examId.title}
        </Title>

        {[
          ...(examDetails?.examId.questions || []),
          ...(examDetails?.examId.listeningExams?.flatMap(
            (le: any) => le.questions || []
          ) || []),
        ].map((q: any, idx: number) => (
          <Card
            key={q._id || idx}
            ref={(el) => (questionRefs.current[idx] = el)}
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {q.audio ? (
              <>
                <audio controls style={{ marginBottom: 8 }}>
                  <source src={q.audio.filePath} type="audio/mpeg" />
                </audio>
                <ListeningQuestionSubmit
                  question={q}
                  questionType={q.questionType || ""}
                  onAnswerChange={handleListeningAnswerChange}
                  currentAnswer={listeningAnswers.find(
                    (ans) => ans.questionId === q._id
                  )}
                />
              </>
            ) : (
              <QuestionSubmit
                question={q}
                questionType={q.questionType || ""}
                onAnswerChange={handleAnswerChange}
                currentAnswer={answers.find((ans) => ans.questionId === q._id)}
              />
            )}
          </Card>
        ))}

        {Examresult && (
          <div className="my-4" ref={resultSectionRef}>
            <Card>
              <Title level={4}>Kết quả</Title>
              <p>
                Điểm số:{" "}
                <strong>
                  {Examresult.correctAnswer} /{" "}
                  {Examresult.correctAnswer + Examresult.wrongAnswer}
                </strong>
              </p>
              <Button type="link" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
              </Button>
              {showDetails && (
                <Collapse>
                  <Panel header="Lời khuyên" key="advice">
                    {loading ? (
                      <Spin />
                    ) : (
                      <Paragraph style={{ whiteSpace: "pre-line" }}>
                        {advice}
                      </Paragraph>
                    )}
                  </Panel>
                  <Panel header="Video liên quan" key="videos">
                    {Examresult.videos &&
                      Object.keys(Examresult.videos).map((key) => (
                        <div key={key}>
                          <Title level={5}>{key}</Title>
                          <Row gutter={[16, 16]}>
                            {Examresult.videos[key].map((video: any) => (
                              <Col span={8} key={video.videoId}>
                                <a
                                  href={video.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    style={{ width: "100%", borderRadius: 8 }}
                                  />
                                  <p>{video.title}</p>
                                </a>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ))}
                  </Panel>
                  <Panel header="Câu hỏi đề nghị" key="suggested">
                    <Collapse>
                      {suggestedQuestions.map((q: Question, id: number) => (
                        <Panel
                          header={`${id + 1}. ${q.content.slice(0, 200)}...`}
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
                  </Panel>
                </Collapse>
              )}
            </Card>
          </div>
        )}
      </Content>

      <Sider
        width={260}
        theme="light"
        style={{
          background: "#f7f8fa",
          borderLeft: "1px solid #f0f0f0",
          padding: "1rem",
        }}
      >
        <Affix offsetTop={20}>
          <div>
            <Title level={5}>Sơ đồ câu hỏi</Title>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: 16,
              }}
            >
              {[
                ...(examDetails?.examId.questions || []),
                ...(examDetails?.examId.listeningExams?.flatMap(
                  (le: any) => le.questions || []
                ) || []),
              ].map((_, index) => (
                <Button
                  size="small"
                  key={index}
                  onClick={() =>
                    questionRefs.current[index]?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Divider />

            <Title level={5}>
              Thời gian còn lại :{" "}
              <strong
                style={{
                  fontWeight: "bold",
                  color: remainingTime <= 60 ? "#ff4d4f" : "#000",
                }}
              >
                {formatTime(remainingTime)}
              </strong>
            </Title>

            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!!Examresult || loading}
              block
            >
              Nộp bài
            </Button>
          </div>
        </Affix>
      </Sider>
    </Layout>
  );
};

export default BaiLam;
