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
import SuggestedQuestionAnswer from "@/components/SuggestedQuestionAnswer";
import usePreventDevTools from "@/security/devtools.security";
import usePreventCopyPaste from "@/security/copyPaste.security";
import "./BaiLam.css";
import {
  AlertOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
const { Panel } = Collapse;
const { Title } = Typography;
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
  const questionRefs = useRef<Record<string, any>>({});
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<Date | null>(null);
  const showSubmitModal = () => {
    setIsSubmitModalVisible(true);
  };
  // Removed duplicate declaration of showAlertModal
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

  const [tabSwitchCount, setTabSwitchCount] = useState(0); // Đếm số lần chuyển tab
  const maxTabSwitches = 3; // Giới hạn số lần chuyển tab

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => prev + 1);
        showAlertModal("Bạn đã chuyển tab. Vui lòng quay lại tab làm bài!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (tabSwitchCount > maxTabSwitches) {
      showAlertModal("Bạn đã chuyển tab quá nhiều lần. Bài thi sẽ bị khóa.");
      handleSubmit(); // Nộp bài hoặc khóa bài thi
    }
  }, [tabSwitchCount]);

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
  // ------------------------------------

  //SECURITY

  const [alertCount, setAlertCount] = useState<number>(() => {
    // Lấy số lần vi phạm từ localStorage khi khởi tạo
    const savedCount = localStorage.getItem("alertCount");
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const [isViolationTriggered, setIsViolationTriggered] = useState(false); // Thêm state để kiểm soát vi phạm
  const [isreport, setisprot] = useState(false);
  const lastViolationTimeRef = useRef<number>(0); // Use useRef instead of useState
  const handleReportViolation = async () => {
    if (isreport) return; // Nếu đã báo cáo vi phạm, không làm gì cả
    setisprot(true); // Đánh dấu đã báo cáo vi phạm
    try {
      const res = await ResultAPI.reportViolation();
      if (res.code !== 200) {
        console.error("Failed to report violation:", res.message);
      }
    } catch (error) {
      console.error("Error reporting violation:", error);
    }
  };
  // Hàm tăng số lần vi phạm (đã sửa đổi)
  const incrementAlertCount = () => {
    if (Examresult || isViolationTriggered) return;

    const now = Date.now();
    console.log(
      lastViolationTimeRef.current,
      now,
      now - lastViolationTimeRef.current
    );
    if (now - lastViolationTimeRef.current < 5000) return; // Ignore violations within 5 seconds

    lastViolationTimeRef.current = now; // Update the ref value immediately
    setIsViolationTriggered(true);

    setAlertCount((prev) => {
      const newCount = prev + 1;

      if (newCount < 5) {
        const remaining = 5 - newCount;
        if (remaining > 0) {
          showAlertModal(
            `Bạn còn ${remaining} lần vi phạm nữa trước khi hệ thống tự động nộp bài.`
          );
        }
      } else {
        alert(
          "Bạn đã vi phạm quá nhiều lần. Hệ thống sẽ tự động nộp bài.\nHành vi của bạn đã được báo cáo. Nếu bạn vi phạm thi quá 5 lần, hệ thống sẽ cấm thi bạn trong 3 ngày"
        );
        handleSubmit();
        handleReportViolation();
      }

      return newCount;
    });

    setTimeout(() => setIsViolationTriggered(false), 2000);
  };

  usePreventDevTools(incrementAlertCount);
  usePreventCopyPaste(incrementAlertCount);

  // fullscreen
  useEffect(() => {
    if (!Examresult && examDetails) {
      const enterFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if ((document as any).webkitRequestFullscreen) {
          (document as any).webkitRequestFullscreen();
        }
      };

      enterFullscreen();

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          incrementAlertCount();
          alert("Bạn đã thoát chế độ toàn màn hình. Hãy quay lại ngay!");
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          incrementAlertCount();
          alert("Bạn đã chuyển tab. Hãy quay lại ngay!");
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [Examresult, examDetails]);

  // ------------------------------------
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSaveSingleAnswer = async (
    questionId: string,
    selectedAnswerId: string | null,
    userAnswer: string | string[] | null,
    isListening: boolean
  ) => {
    if (!examDetails) return;

    try {
      // Delay the request until the question loses focus
      const saveAnswer = () =>
        ResultAPI.saveSingleAnswer(
          examDetails._id,
          questionId,
          selectedAnswerId,
          userAnswer,
          isListening,
          {} // Provide the missing argument (adjust as per the expected type)
        );

      // Use a debounce mechanism to reduce requests
      if (questionRefs.current[questionId as string]) {
        clearTimeout(questionRefs.current[questionId].debounceTimer);
      }

      questionRefs.current[questionId] = {
        debounceTimer: setTimeout(saveAnswer, 500), // Delay of 500ms
      };
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

      // Save single answer only when the question loses focus
      handleSaveSingleAnswer(
        newAnswer.questionId,
        newAnswer.selectedAnswerId,
        newAnswer.userAnswer,
        false
      );

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

      // Save single listening answer only when the question loses focus
      handleSaveSingleAnswer(
        newAnswer.questionId,
        newAnswer.selectedAnswerId,
        newAnswer.userAnswer,
        true
      );

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

    localStorage.removeItem("alertCount");
    setAlertCount(0);

    const unansweredQuestions = getUnansweredQuestions();

    const enrichedAnswers = answers.map((ans) => {
      const question = Object.values(groupedQuestions)
        .flat()
        .find((q) => q._id === ans.questionId);
      return {
        questionId: ans.questionId,
        selectedAnswerId: ans.selectedAnswerId,
        userAnswer: ans.userAnswer,
        questionType: question?.questionType || "",
      };
    });

    const enrichedListeningAnswers = listeningAnswers.map((ans) => {
      const question = Object.values(groupedQuestions)
        .flat()
        .find((q) => q._id === ans.questionId);
      return {
        questionId: ans.questionId,
        selectedAnswerId: ans.selectedAnswerId,
        userAnswer: ans.userAnswer,
        questionType: question?.questionType || "",
      };
    });

    const questionTypes = [
      ...enrichedAnswers.map((ans) => ans.questionType),
      ...enrichedListeningAnswers.map((ans) => ans.questionType),
    ];

    const submitAnswer: SubmitAnswer = {
      resultId: examDetails._id,
      answers: enrichedAnswers,
      listeningAnswers: enrichedListeningAnswers,
      unansweredQuestions,
      questionTypes,
    };

    try {
      const response = await ResultAPI.submitAnswer(submitAnswer);
      if (response.code === 200) {
        setExamresult(response);
        setSuggestedQuestions(response.suggestionQuestion);
        setRemainingTime(0);
        localStorage.removeItem("alertCount");
        setAlertCount(0);
        setIsSubmitModalVisible(false);

        // Scroll to result section smoothly
        setTimeout(() => {
          resultSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 300);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showAlertModal("Đã xảy ra lỗi khi nộp bài.");
    }
  };

  useEffect(() => {
    const fetchPostSubmitData = async () => {
      if (Examresult) {
        setLoading(true); // Set loading to true before fetching
        try {
          const advResponse = await gemini(Examresult.arrResponse);
          setAdvice(advResponse); // Update advice with fetched data
        } catch (error) {
          console.error("Error fetching advice:", error);
        } finally {
          setLoading(false); // Ensure loading is set to false after fetching
        }

        const updated: Question[] = [];
        for (const sug of suggestedQuestions) {
          if (sug._id) {
            const res = await QuestionAPI.getQuestion(sug._id);
            if (res.code === 200) updated.push(res.question);
          }
        }
        setSuggestedQuestions(updated);
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

  const renderListeningSection = (listeningExam: any, sectionIndex: number) => {
    return (
      <div key={listeningExam._id} style={{ marginBottom: "24px" }}>
        <Title level={4}>Phần nghe {sectionIndex}</Title>
        <audio controls style={{ marginBottom: "16px" }}>
          <source src={listeningExam.audio.filePath} type="audio/mpeg" />
        </audio>
        {listeningExam.questions.map((q: any, idx: number) => {
          const questionIndex = globalQuestionIndex++;
          return (
            <Card
              key={q._id || idx}
              ref={(el) => {
                if (el) questionRefs.current[questionIndex] = el;
              }}
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <ListeningQuestionSubmit
                question={q}
                questionType={q.questionType || ""}
                onAnswerChange={handleListeningAnswerChange}
                currentAnswer={listeningAnswers.find(
                  (ans) => ans.questionId === q._id
                )}
                viewOnly={!!Examresult}
                questionIndex={questionIndex} // Pass questionIndex
              />
            </Card>
          );
        })}
      </div>
    );
  };

  const renderQuestionMap = () => {
    let questionNumber = 1;
    const listeningSections = examDetails?.examId.listeningExams || [];
    const readingSections = Object.keys(groupedQuestions).filter(
      (key) => key !== "no-passage"
    );
    const otherQuestions =
      groupedQuestions["no-passage"]?.filter(
        (q) =>
          !listeningSections.some((le: any) =>
            le.questions.some((lq: any) => lq._id === q._id)
          )
      ) || [];

    const getButtonColor = (questionId: string) => {
      if (!Examresult) {
        const isAnswered =
          answers.some((ans) => ans.questionId === questionId) ||
          listeningAnswers.some((ans) => ans.questionId === questionId);
        return isAnswered ? "#52c41a" : "#d9d9d9";
      } else {
        const correctAnswer =
          Examresult.details?.find((ans) => ans.questionId === questionId) ||
          Examresult.listeningQuestions?.find(
            (ans: any) => ans.questionId === questionId
          );

        if (!correctAnswer) {
          return "#ff4d4f";
        }

        return correctAnswer.isCorrect ? "#52c41a" : "#ff4d4f";
      }
    };

    const allQuestions: { id: string; index: number }[] = [];

    // Collect all listening questions
    listeningSections.forEach((section: any) => {
      section.questions.forEach((q: any) => {
        allQuestions.push({ id: q._id, index: questionNumber++ });
      });
    });

    // Collect all reading questions
    readingSections.forEach((passageId) => {
      groupedQuestions[passageId].forEach((q) => {
        allQuestions.push({ id: q._id, index: questionNumber++ });
      });
    });

    // Collect other questions
    otherQuestions.forEach((q) => {
      allQuestions.push({ id: q._id, index: questionNumber++ });
    });

    return (
      <div className="question-map-grid">
        {allQuestions.map((q) => {
          const buttonColor = getButtonColor(q.id);
          return (
            <Button
              key={`map-btn-${q.index}`}
              className="question-map-btn"
              style={{
                backgroundColor: buttonColor,
                color: buttonColor === "#d9d9d9" ? "#000" : "#fff",
                borderColor: buttonColor,
              }}
              onClick={() =>
                questionRefs.current[q.index - 1]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
            >
              {q.index}
            </Button>
          );
        })}
      </div>
    );
  };

  // Initialize globalQuestionIndex to 1
  let globalQuestionIndex = 1;

  const showAlertModal = (message: string) => {
    setAlertMessage(message);
    setIsAlertModalVisible(true);
  };

  return (
    <Layout className="exam-layout-container">
      <Layout className="exam-main-layout">
        <Content className="exam-content-modern">
          {/* Render Listening Sections */}
          {examDetails?.examId.listeningExams?.map((le: any, idx: number) =>
            renderListeningSection(le, idx + 1)
          )}

          {/* Render Non-Listening Questions */}
          {Object.keys(groupedQuestions).length > 1 ||
          !groupedQuestions["no-passage"] ? (
            Object.keys(groupedQuestions).map((passageId, groupIndex) => {
              const filteredQuestions = groupedQuestions[passageId].filter(
                (q) =>
                  !examDetails?.examId.listeningExams?.some((le: any) =>
                    le.questions.some((lq: any) => lq._id === q._id)
                  )
              );

              if (filteredQuestions.length === 0) return null;

              return (
                <div key={groupIndex} className="passage-container">
                  {passageId !== "no-passage" &&
                    filteredQuestions[0]?.passageId?.content && (
                      <div className="passage-grid">
                        <div
                          className="passage-text"
                          dangerouslySetInnerHTML={{
                            __html:
                              filteredQuestions[0].passageId.content.replace(
                                /\n/g,
                                "<br />"
                              ),
                          }}
                        ></div>

                        <div className="passage-questions-list">
                          {filteredQuestions.map((q, idx) => {
                            const questionIndex = globalQuestionIndex++;
                            return (
                              <Card
                                key={q._id || idx}
                                ref={(el) => {
                                  if (el)
                                    questionRefs.current[questionIndex] = el;
                                }}
                                className="question-card-modern"
                              >
                                <div className="question-actions">
                                  <img
                                    src={errorrIcon}
                                    alt="Báo lỗi"
                                    onClick={() => handleReportError(q)}
                                    className="report-icon"
                                  />
                                </div>

                                {q.audio ? (
                                  <>
                                    <audio
                                      controls
                                      className="audio-player-modern"
                                    >
                                      <source
                                        src={q.audio.filePath}
                                        type="audio/mpeg"
                                      />
                                    </audio>
                                    <ListeningQuestionSubmit
                                      question={q}
                                      questionType={q.questionType || ""}
                                      onAnswerChange={
                                        handleListeningAnswerChange
                                      }
                                      currentAnswer={listeningAnswers.find(
                                        (ans) => ans.questionId === q._id
                                      )}
                                      viewOnly={!!Examresult}
                                      questionIndex={questionIndex}
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
                                    viewOnly={!!Examresult}
                                    questionIndex={questionIndex}
                                  />
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              );
            })
          ) : (
            <div className="questions-list-single">
              {groupedQuestions["no-passage"]
                ?.filter(
                  (q) =>
                    !examDetails?.examId.listeningExams?.some((le: any) =>
                      le.questions.some((lq: any) => lq._id === q._id)
                    )
                )
                .map((q, idx) => {
                  const questionIndex = globalQuestionIndex++;
                  return (
                    <Card
                      key={q._id || idx}
                      ref={(el) => {
                        if (el) questionRefs.current[questionIndex] = el;
                      }}
                      className="question-card-modern"
                    >
                      <div className="question-actions">
                        <img
                          src={errorrIcon}
                          alt="Báo lỗi"
                          onClick={() => handleReportError(q)}
                          className="report-icon"
                        />
                      </div>

                      {q.audio ? (
                        <>
                          <audio controls className="audio-player-modern">
                            <source src={q.audio.filePath} type="audio/mpeg" />
                          </audio>
                          <ListeningQuestionSubmit
                            question={q}
                            questionType={q.questionType || ""}
                            onAnswerChange={handleListeningAnswerChange}
                            currentAnswer={listeningAnswers.find(
                              (ans) => ans.questionId === q._id
                            )}
                            viewOnly={!!Examresult}
                            questionIndex={questionIndex}
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
                          viewOnly={!!Examresult}
                          questionIndex={questionIndex}
                        />
                      )}
                    </Card>
                  );
                })}
            </div>
          )}

          {/* Result Section */}
          {Examresult && (
            <div className="result-section-modern" ref={resultSectionRef}>
              <Card className="result-card-main" bordered={false}>
                <div className="result-header">
                  <TrophyOutlined className="result-trophy-icon" />
                  <Title level={2} className="result-title">
                    Kết quả làm bài
                  </Title>
                </div>

                <div className="result-stats-grid">
                  <div className="result-stat-card score-card">
                    <div className="stat-icon-wrapper">
                      <TrophyOutlined />
                    </div>
                    <div className="stat-info">
                      <div className="stat-number">{Examresult.score}</div>
                      <div className="stat-label">Điểm số / 10</div>
                    </div>
                  </div>

                  <div className="result-stat-card correct-card">
                    <div className="stat-icon-wrapper">
                      <CheckCircleOutlined />
                    </div>
                    <div className="stat-info">
                      <div className="stat-number">
                        {Examresult.correctAnswer}/{Examresult.totalQuestion}
                      </div>
                      <div className="stat-label">Câu đúng</div>
                    </div>
                  </div>

                  <div className="result-stat-card time-card">
                    <div className="stat-icon-wrapper">
                      <ClockCircleOutlined />
                    </div>
                    <div className="stat-info">
                      <div className="stat-number">
                        {examDetails?.examId.duration -
                          Math.floor(remainingTime / 60)}
                      </div>
                      <div className="stat-label">Phút đã làm</div>
                    </div>
                  </div>
                </div>

                <Divider />

                <Button
                  type="link"
                  onClick={() => setShowDetails(!showDetails)}
                  className="toggle-details-btn"
                >
                  {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
                </Button>

                {showDetails && (
                  <Collapse
                    className="result-collapse-modern"
                    onChange={(activeKeys) => {
                      if (Array.isArray(activeKeys)) {
                        activeKeys.forEach((key) =>
                          handleExpandSuggestedQuestion(key)
                        );
                      } else {
                        handleExpandSuggestedQuestion(activeKeys);
                      }
                    }}
                  >
                    <Panel
                      header="💡 Lời khuyên"
                      key="advice"
                      className="collapse-panel-modern"
                    >
                      {loading ? (
                        <Spin />
                      ) : (
                        <div
                          className="advice-content"
                          dangerouslySetInnerHTML={{
                            __html: advice
                              .replace(/\*/g, "")
                              .replace(/\n/g, "<br />"),
                          }}
                        />
                      )}
                    </Panel>

                    <Panel
                      header="📺 Video liên quan"
                      key="videos"
                      className="collapse-panel-modern"
                    >
                      {Examresult.videos &&
                        Object.keys(Examresult.videos).map((key) => (
                          <div key={key} className="video-section">
                            <Title level={5}>{key}</Title>
                            <Row gutter={[16, 16]}>
                              {Examresult.videos[key].map((video: any) => (
                                <Col xs={24} sm={12} md={8} key={video.videoId}>
                                  <a
                                    href={video.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="video-card"
                                  >
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="video-thumbnail"
                                    />
                                    <p className="video-title">{video.title}</p>
                                  </a>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        ))}
                    </Panel>

                    <Panel
                      header="📝 Câu hỏi đề nghị"
                      key="suggested"
                      className="collapse-panel-modern"
                    >
                      <Collapse className="suggested-questions-collapse">
                        {suggestedQuestions.map((q: Question, id: number) => (
                          <Panel
                            header={`${id + 1}. ${q.content.slice(0, 200)}...`}
                            key={q._id ?? id}
                            onClick={() => handleExpandSuggestedQuestion(q._id)}
                          >
                            {q.detailsFetched ? (
                              <SuggestedQuestionAnswer question={q} />
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

        {/* Mini Sidebar Fixed */}
        <div className="exam-minimap-fixed">
          <div className="minimap-timer">
            <ClockCircleOutlined />
            <span className={remainingTime <= 60 ? "critical" : ""}>
              {formatTime(remainingTime)}
            </span>
          </div>

          <div className="minimap-questions">{renderQuestionMap()}</div>

          <Button
            type="primary"
            onClick={showSubmitModal}
            disabled={!!Examresult || loading}
            className="minimap-submit-btn"
            block
          >
            <PlayCircleOutlined /> Nộp bài
          </Button>
        </div>
      </Layout>

      {/* Modals */}
      {showErrorModal && selectedQuestion && (
        <ErrorReportModal
          questionId={selectedQuestion._id}
          examId={examDetails.examId._id}
          userId={examDetails.userId}
          onClose={handleCloseModal}
        />
      )}

      <Modal
        title="Xác nhận nộp bài"
        visible={isSubmitModalVisible}
        onOk={async () => {
          setIsSubmitting(true);
          await handleSubmit();
          setIsSubmitting(false);
        }}
        onCancel={handleCancelSubmit}
        okText="Có"
        cancelText="Không"
        confirmLoading={isSubmitting}
        className="submit-modal-modern"
      >
        <p>Bạn có chắc chắn muốn nộp bài không?</p>
        <p className="unanswered-notice">
          Còn <strong>{getUnansweredQuestions().length}</strong> câu hỏi chưa
          được làm.
        </p>
      </Modal>

      <Modal
        title="Thông báo"
        visible={isAlertModalVisible}
        onOk={() => {
          setIsAlertModalVisible(false);
          if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if ((document as any).webkitRequestFullscreen) {
              (document as any).webkitRequestFullscreen();
            }
          }
        }}
        okText="Đóng"
        className="alert-modal-modern"
      >
        <p>{alertMessage}</p>
      </Modal>
    </Layout>
  );
};

export default BaiLam;
