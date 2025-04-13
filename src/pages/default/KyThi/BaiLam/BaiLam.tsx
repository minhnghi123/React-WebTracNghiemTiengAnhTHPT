import React, { useEffect, useRef, useState } from "react";
import { ResultAPI, SubmitAnswer } from "@/services/student";
import { ExamResult, QuestionAPI } from "@/services/teacher/Teacher";
import { QuestionAPIStudent } from "@/services/student";
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
  Modal,
  Statistic,
} from "antd";
import { gemini } from "@/services/GoogleApi";
import QuestionSubmit from "./QuestionSumit";
import ListeningQuestionSubmit from "./listeningQuestionSubmit";
import { Question } from "@/types/interface";
import ErrorReportModal from "@/components/ErrorReportModal"; // Import ErrorReportModal
import errorrIcon from "@/Content/img/errorr.png"; // Import your error icon

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;
const { Sider, Content } = Layout;

const BaiLam: React.FC = () => {
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [Examresult, setExamresult] = useState<ExamResult>();
  const [suggestedQuestions, setSuggestedQuestions] = useState<Question[]>([]);
  const [advice, setAdvice] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<any[]>([]);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [groupedQuestions, setGroupedQuestions] = useState<
    Record<string, any[]>
  >({});
  const questionRefs = useRef<any[]>([]);
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<Date | null>(null);
  const showSubmitModal = () => {
    setIsSubmitModalVisible(true);
  };
  const showAlertModal = (message: string) => {
    setAlertMessage(message);
    setIsAlertModalVisible(true);
  };
  const handleCancelSubmit = () => {
    setIsSubmitModalVisible(false);
  };
  //xac dinh cau nao chua lam
  const getUnansweredQuestions = () => {
    const unanswered = [];

    for (const passageId of Object.keys(groupedQuestions)) {
      const questions = groupedQuestions[passageId];
      for (const question of questions) {
        const isAnswered =
          answers.some((ans) => ans.questionId === question._id) ||
          listeningAnswers.some((ans) => ans.questionId === question._id);

        if (!isAnswered) {
          unanswered.push(question);
        }
      }
    }
    //chỉ lấy id
    const unansweredIds = unanswered.map((question) => question._id);

    return unansweredIds; // Trả về id các câu hỏi chưa được trả lời
  };
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await ResultAPI.getInCompletedExam();
        if (response.code === 200 && response.results) {
          setExamDetails(response.results);

          // Group questions by passageId
          const questions = [
            ...(response.results.examId.questions || []),
            ...(response.results.examId.listeningExams?.flatMap(
              (le: any) => le.questions || []
            ) || []),
          ];
          const grouped = questions.reduce(
            (acc: Record<string, any[]>, question: any) => {
              const passageId =
                question.passageId?._id || question.passageId || "no-passage";
              if (!acc[passageId]) acc[passageId] = [];
              acc[passageId].push(question);
              return acc;
            },
            {}
          );
          setGroupedQuestions(grouped);

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
        showAlertModal("Hết thời gian làm bài");
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

  const handleSaveSingleAnswer = async (
    questionId: string,
    answer: string | string[],
    isListening: boolean
  ) => {
    if (!examDetails) return;

    try {
      await ResultAPI.saveSingleAnswer({
        resultId: examDetails._id,
        questionId,
        answer,
        isListening,
      });
    } catch (error) {
      console.error("Error saving single answer:", error);
    }
  };

  const handleAnswerChange = (newAnswer: any) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (a) => a.questionId === newAnswer.questionId
      );
      if (index !== -1) updated[index] = newAnswer;
      else updated.push(newAnswer);

      // Save single answer
      handleSaveSingleAnswer(newAnswer.questionId, newAnswer.userAnswer, false);

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

      // Save single listening answer
      handleSaveSingleAnswer(newAnswer.questionId, newAnswer.userAnswer, true);

      return updated;
    });
  };

  const handleSubmit = async () => {
    if (Examresult) {
      showAlertModal("Bạn đã nộp bài rồi");
      return;
    }
    if (!examDetails) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Xác định các câu hỏi chưa trả lời
    const unansweredQuestions = getUnansweredQuestions();
    console.log("Unanswered Questions:", unansweredQuestions);

    const submitAnswer: SubmitAnswer = {
      resultId: examDetails._id,
      answers,
      listeningAnswers,
      unansweredQuestions,
    };

    try {
      const response = await ResultAPI.submitAnswer(submitAnswer);
      if (response.code === 200) {
        showAlertModal("Nộp bài thành công");
        setExamresult(response);
        setSuggestedQuestions(response.suggestionQuestion);
        setRemainingTime(0);
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showAlertModal("Đã xảy ra lỗi khi nộp bài.");
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

  const handleReportError = (question: Question) => {
    setSelectedQuestion(question);
    setShowErrorModal(true);
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
    setSelectedQuestion(null);
  };

  const handleExpandSuggestedQuestion = async (questionId: string) => {
    const existingQuestion = suggestedQuestions.find(
      (q) => q._id === questionId
    );
    if (existingQuestion && existingQuestion.detailsFetched) return;

    try {
      let response = await QuestionAPIStudent.getQuestionForStudent(questionId);
      if (response.code === 200) {
        setSuggestedQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId
              ? { ...q, ...response.question, detailsFetched: true }
              : q
          )
        );
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
    }
  };

  // Initialize globalQuestionIndex to 0
  let globalQuestionIndex = 0;

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
          {examDetails?.examId.title}
        </Title>

        {Object.keys(groupedQuestions).length > 1 ||
        !groupedQuestions["no-passage"] ? (
          // Case: Questions grouped by passages
          Object.keys(groupedQuestions).map((passageId, groupIndex) => {
            return (
              <div
                key={groupIndex}
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "24px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                {passageId !== "no-passage" &&
                  groupedQuestions[passageId][0]?.passageId?.content && (
                    // Left Panel: Passage Content
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        maxHeight: "500px",
                        padding: "16px",
                        borderRight: "1px solid #ddd",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: groupedQuestions[
                          passageId
                        ][0].passageId.content.replace(/\n/g, "<br />"),
                      }}
                    ></div>
                  )}

                {/* Right Panel: Scrollable Questions */}
                <div
                  style={{
                    flex: 2,
                    overflowY: "auto",
                    maxHeight: "500px",
                    padding: "16px",
                  }}
                >
                  {groupedQuestions[passageId].map((q, idx) => {
                    // Use globalQuestionIndex for consistent numbering
                    const questionIndex = globalQuestionIndex++;
                    return (
                      <Card
                        key={q._id || idx}
                        ref={(el) => {
                          if (el) questionRefs.current[questionIndex] = el; // Only add non-null elements
                        }}
                        style={{
                          marginBottom: 24,
                          borderRadius: 12,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <img
                            src={errorrIcon}
                            alt="Báo lỗi"
                            onClick={() => handleReportError(q)}
                            style={{
                              marginTop: 8,
                              height: 20,
                              width: 20,
                              cursor: "pointer",
                            }}
                          />
                        </div>

                        {q.audio ? (
                          <>
                            <audio controls style={{ marginBottom: 8 }}>
                              <source
                                src={q.audio.filePath}
                                type="audio/mpeg"
                              />
                            </audio>
                            <ListeningQuestionSubmit
                              question={q}
                              questionType={q.questionType || ""}
                              onAnswerChange={handleListeningAnswerChange}
                              currentAnswer={listeningAnswers.find(
                                (ans) => ans.questionId === q._id
                              )}
                              // index={questionIndex} // Removed as it is not part of ListeningQuestionComponentProps
                              viewOnly={!!Examresult} // Add view-only mode when Examresult exists
                            />
                          </>
                        ) : (
                          <QuestionSubmit
                            question={q}
                            questionType={q.questionType || ""}
                            onAnswerChange={handleAnswerChange}
                            currentAnswer={answers.find(
                              (ans) => ans.questionId === q._id
                            )}
                            index={questionIndex}
                            viewOnly={!!Examresult} // Add view-only mode when Examresult exists
                          />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Case: No passages, display questions in a single column
          <div>
            {groupedQuestions["no-passage"]?.map((q, idx) => {
              const questionIndex = globalQuestionIndex++;
              return (
                <Card
                  key={q._id || idx}
                  ref={(el) => {
                    if (el) questionRefs.current[questionIndex] = el; // Only add non-null elements
                  }}
                  style={{
                    marginBottom: 24,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <img
                      src={errorrIcon}
                      alt="Báo lỗi"
                      onClick={() => handleReportError(q)}
                      style={{
                        marginTop: 8,
                        height: 20,
                        width: 20,
                        cursor: "pointer",
                      }}
                    />
                  </div>

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
                        // index={questionIndex}
                        viewOnly={!!Examresult} // Add view-only mode when Examresult exists
                      />
                    </>
                  ) : (
                    <QuestionSubmit
                      question={q}
                      questionType={q.questionType || ""}
                      onAnswerChange={handleAnswerChange}
                      currentAnswer={answers.find(
                        (ans) => ans.questionId === q._id
                      )}
                      index={questionIndex}
                      viewOnly={!!Examresult} // Add view-only mode when Examresult exists
                    />
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {showErrorModal && selectedQuestion && (
          <ErrorReportModal
            questionId={selectedQuestion._id}
            examId={examDetails.examId._id}
            userId={examDetails.userId}
            onClose={handleCloseModal}
          />
        )}

        {Examresult && (
          <div className="my-4" ref={resultSectionRef}>
            <Card>
              <Title level={4}>🎯 Kết quả làm bài</Title>

              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} sm={12} md={8}>
                  <Statistic
                    title="Điểm số"
                    value={Examresult.score}
                    precision={1}
                    suffix="/ 10"
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Statistic
                    title="Câu đúng"
                    value={Examresult.correctAnswer}
                    suffix={`/ ${Examresult.totalQuestion}`}
                  />
                </Col>
              </Row>

              <Divider />

              <Button type="link" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
              </Button>

              {showDetails && (
                <Collapse>
                  {/* Lời khuyên */}
                  <Panel header="Lời khuyên" key="advice">
                    {loading ? (
                      <Spin />
                    ) : (
                      <Paragraph style={{ whiteSpace: "pre-line" }}>
                        {advice}
                      </Paragraph>
                    )}
                  </Panel>

                  {/* Video liên quan */}
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

                  {/* Câu hỏi đề nghị */}
                  <Panel header="Câu hỏi đề nghị" key="suggested">
                    <Collapse>
                      {suggestedQuestions.map((q: Question, id: number) => (
                        <Panel
                          header={`${id + 1}. ${q.content.slice(0, 200)}...`}
                          key={q._id ?? id}
                          onClick={() => handleExpandSuggestedQuestion(q._id)}
                        >
                          {q.detailsFetched ? (
                            <>
                              <QuestionSubmit
                                question={q}
                                questionType={q.questionType || ""}
                                onAnswerChange={() => {}}
                                index={0}
                                viewOnly={true}
                              />
                              <div
                                style={{ marginTop: "8px", color: "#52c41a" }}
                              >
                                <strong>Đáp án đúng:</strong>{" "}
                                {/* Your answer display logic here */}
                              </div>
                            </>
                          ) : (
                            <Spin />
                          )}
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
              {questionRefs.current
                .filter((ref) => ref) // Filter out any undefined/null elements
                .map((_, index) => {
                  let questionId: string | undefined;
                  let currentIndex = 0;

                  for (const passageId of Object.keys(groupedQuestions)) {
                    const questions = groupedQuestions[passageId];
                    if (index < currentIndex + questions.length) {
                      questionId = questions[index - currentIndex]?._id;
                      break;
                    }
                    currentIndex += questions.length;
                  }

                  // Determine if the question is answered
                  const isAnswered =
                    answers.some((ans) => ans.questionId === questionId) ||
                    listeningAnswers.some(
                      (ans) => ans.questionId === questionId
                    );

                  return (
                    <Button
                      size="small"
                      key={index}
                      style={{
                        backgroundColor: isAnswered ? "#52c41a" : "#f0f0f0", // Green for answered, default for unanswered
                        color: isAnswered ? "#fff" : "#000",
                      }}
                      onClick={() =>
                        questionRefs.current[index]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center", // Ensure the question is centered in view
                        })
                      }
                    >
                      {index + 1}
                    </Button>
                  );
                })}
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
              onClick={showSubmitModal}
              disabled={!!Examresult || loading}
              block
            >
              Nộp bài
            </Button>
          </div>
        </Affix>
      </Sider>
      {/*  */}
      <Modal
        title="Xác nhận nộp bài"
        visible={isSubmitModalVisible}
        onOk={() => {
          handleSubmit(); // Gọi hàm handleSubmit khi người dùng xác nhận
          setIsSubmitModalVisible(false); // Đóng Modal sau khi xác nhận
        }}
        onCancel={handleCancelSubmit}
        okText="Có"
        cancelText="Không"
      >
        <p>Bạn có chắc chắn muốn nộp bài không?</p>
      </Modal>
      {/*modal xac nhan nop bai  */}
      <Modal
        title="Xác nhận nộp bài"
        visible={isSubmitModalVisible}
        onOk={async () => {
          setIsSubmitting(true); // Bật trạng thái loading
          await handleSubmit(); // Gọi hàm handleSubmit
          setIsSubmitting(false); // Tắt trạng thái loading
          setIsSubmitModalVisible(false); // Đóng Modal
        }}
        onCancel={handleCancelSubmit}
        okText="Có"
        cancelText="Không"
        confirmLoading={isSubmitting} // Hiển thị loading trên nút "Có"
      >
        <p>Bạn có chắc chắn muốn nộp bài không?</p>
        <p>Còn {getUnansweredQuestions().length} câu hỏi chưa được làm.</p>
      </Modal>
      {/* modal alert */}
      <Modal
        title="Thông báo"
        visible={isAlertModalVisible}
        onOk={() => setIsAlertModalVisible(false)}
        okText="Đóng"
      >
        <p>{alertMessage}</p>
      </Modal>
    </Layout>
  );
};

export default BaiLam;
