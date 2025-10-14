import React, { useEffect, useRef, useState } from "react";
import { ResultAPI, SubmitAnswer } from "@/services/student";
import { ExamResult, QuestionAPI } from "@/services/teacher/Teacher";
import { QuestionAPIStudent } from "@/services/student";
import {
  Button,
  Card,
  Collapse,
  Spin,
  Layout, // ✅ Thêm dòng này
  Typography,
  Row,
  Col,
  Affix,
  Divider,
  Modal,
  Statistic,
  Pagination,
} from "antd";
import { gemini } from "@/services/GoogleApi";
import QuestionSubmit from "./QuestionSumit";
import ListeningQuestionSubmit from "./listeningQuestionSubmit";
import { Question } from "@/types/interface";
import ErrorReportModal from "@/components/ErrorReportModal";
import errorrIcon from "@/Content/img/errorr.png";
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
  YoutubeFilled,
  BulbOutlined,
} from "@ant-design/icons";
import { Pie } from "@ant-design/plots";

const { Panel } = Collapse;
const { Title, Text: AntText } = Typography;
const { Sider, Content } = Layout; // ✅ Thêm dòng này

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
      if (document.visibilityState === "hidden" && !Examresult) {
        // Thêm check Examresult
        setTabSwitchCount((prev) => prev + 1);
        showAlertModal("Bạn đã chuyển tab. Vui lòng quay lại tab làm bài!");
      }
    };

    if (!Examresult) {
      // CHỈ add listener khi chưa có kết quả
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [Examresult]);

  useEffect(() => {
    if (tabSwitchCount > maxTabSwitches && !Examresult) {
      // Thêm check Examresult
      showAlertModal("Bạn đã chuyển tab quá nhiều lần. Bài thi sẽ bị khóa.");
      handleSubmit();
    }
  }, [tabSwitchCount, Examresult]);

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

  // SECURITY - CHỈ kích hoạt khi chưa nộp bài
  usePreventDevTools(Examresult ? () => {} : incrementAlertCount); // Disable khi đã có kết quả
  usePreventCopyPaste(Examresult ? () => {} : incrementAlertCount); // Disable khi đã có kết quả

  // fullscreen - CHỈ kích hoạt khi chưa nộp bài
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
        if (!document.fullscreenElement && !Examresult) {
          // Thêm check Examresult
          incrementAlertCount();
          alert("Bạn đã thoát chế độ toàn màn hình. Hãy quay lại ngay!");
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden" && !Examresult) {
          // Thêm check Examresult
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

    // Nếu đã có kết quả, exit fullscreen
    if (Examresult && document.fullscreenElement) {
      document
        .exitFullscreen()
        .catch((err) => console.log("Exit fullscreen error:", err));
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

        // ✅ FIX: Đảm bảo scroll xuống result section
        // Đợi React re-render xong
        setTimeout(() => {
          // Method 1: Scroll bằng scrollIntoView
          const resultSection = document.getElementById("result-section");
          if (resultSection) {
            resultSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }

          // Method 2: Fallback nếu method 1 không work
          if (resultSectionRef.current) {
            const yOffset = -20; // Offset từ top
            const element = resultSectionRef.current;
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;

            window.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }
        }, 1000); // Tăng delay lên 1 giây để đảm bảo DOM đã render
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showAlertModal("Đã xảy ra lỗi khi nộp bài.");
    }
  };

  useEffect(() => {
    const fetchPostSubmitData = async () => {
      if (Examresult) {
        console.log("=== DEBUG EXAM RESULT ===");
        console.log("Full Examresult:", Examresult);
        console.log("Videos object:", Examresult.videos);
        console.log("Videos type:", typeof Examresult.videos);
        console.log(
          "Videos keys:",
          Examresult.videos ? Object.keys(Examresult.videos) : "null"
        );
        console.log("=========================");

        setLoading(true);
        try {
          // Fetch AI advice
          if (Examresult.arrResponse) {
            const advResponse = await gemini(Examresult.arrResponse);
            setAdvice(advResponse);
          }
        } catch (error) {
          console.error("Error fetching advice:", error);
          setAdvice("Không thể tải lời khuyên từ AI. Vui lòng thử lại sau.");
        } finally {
          setLoading(false);
        }

        // Fetch suggested questions details
        if (
          Examresult.suggestionQuestion &&
          Array.isArray(Examresult.suggestionQuestion)
        ) {
          const updated: Question[] = [];
          for (const sug of Examresult.suggestionQuestion) {
            if (sug._id) {
              try {
                const res = await QuestionAPIStudent.getQuestionForStudent(
                  sug._id
                );
                if (res.code === 200) {
                  updated.push({
                    ...res.question,
                    detailsFetched: true,
                  });
                }
              } catch (error) {
                console.error(`Error fetching question ${sug._id}:`, error);
              }
            }
          }
          setSuggestedQuestions(updated);
        }
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

    // Nếu đã fetch rồi thì return luôn
    if (existingQuestion && existingQuestion.detailsFetched) return;

    try {
      // Set loading state cho câu hỏi cụ thể
      setSuggestedQuestions((prev) =>
        prev.map((q) => (q._id === questionId ? { ...q, loading: true } : q))
      );

      let response = await QuestionAPIStudent.getQuestionForStudent(questionId);

      if (response.code === 200) {
        setSuggestedQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId
              ? {
                  ...q,
                  ...response.question,
                  detailsFetched: true,
                  loading: false,
                }
              : q
          )
        );
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
      // Set loading false khi có lỗi
      setSuggestedQuestions((prev) =>
        prev.map((q) => (q._id === questionId ? { ...q, loading: false } : q))
      );
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

          {/* Result Section - ✅ Thêm ID và ref để dễ scroll */}
          {Examresult && (
            <div
              className="result-section-modern"
              ref={resultSectionRef}
              id="result-section"
              style={{ scrollMarginTop: "20px" }} // ✅ Thêm margin khi scroll
            >
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

                {/* Pie Chart */}
                <Card className="chart-card" bordered={false}>
                  <Title level={3} className="chart-title">
                    Phân tích kết quả
                  </Title>
                  <div className="chart-container">
                    {(() => {
                      const correctCount = Examresult.correctAnswer || 0;
                      const totalQuestions = Examresult.totalQuestion || 0;
                      const answeredCount =
                        (Examresult.details?.length || 0) +
                        (Examresult.listeningQuestions?.length || 0);
                      const incorrectCount = answeredCount - correctCount;
                      const skippedCount = totalQuestions - answeredCount;

                      const chartData = [
                        { type: "Đúng", value: correctCount },
                        { type: "Sai", value: incorrectCount },
                        { type: "Bỏ qua", value: skippedCount },
                      ];

                      const config = {
                        data: chartData,
                        angleField: "value",
                        colorField: "type",
                        radius: 0.8,
                        innerRadius: 0.6,
                        label: false,
                        legend: {
                          position: "bottom" as const,
                          itemName: {
                            formatter: (text: string, item: any) => {
                              const percentage = (
                                (item.value / totalQuestions) *
                                100
                              ).toFixed(1);
                              return `${text}: ${item.value} (${percentage}%)`;
                            },
                          },
                        },
                        statistic: {
                          title: {
                            offsetY: -8,
                            content: "Tổng số",
                            style: { fontSize: "14px", color: "#6b7280" },
                          },
                          content: {
                            offsetY: 4,
                            content: totalQuestions.toString(),
                            style: {
                              fontSize: "32px",
                              fontWeight: "bold",
                              color: "#1f2937",
                            },
                          },
                        },
                        color: ({ type }: any) => {
                          const colors: Record<string, string> = {
                            Đúng: "#22c55e",
                            Sai: "#ef4444",
                            "Bỏ qua": "#9ca3af",
                          };
                          return colors[type] || "#3b82f6";
                        },
                      };

                      return <Pie {...config} />;
                    })()}
                  </div>
                </Card>

                <Divider />

                <Button
                  type="link"
                  onClick={() => setShowDetails(!showDetails)}
                  className="toggle-details-btn"
                >
                  {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
                </Button>

                {showDetails && (
                  <Collapse className="result-collapse-modern">
                    {/* AI Advice */}
                    <Panel
                      header={
                        <div className="panel-header-custom">
                          <BulbOutlined className="panel-icon" />
                          <span>Lời khuyên từ AI</span>
                        </div>
                      }
                      key="advice"
                    >
                      {loading ? (
                        <div className="loading-content">
                          <Spin />
                          <AntText>Đang phân tích kết quả...</AntText>
                        </div>
                      ) : advice ? (
                        <div className="advice-content-wrapper">
                          <div
                            className="advice-text"
                            dangerouslySetInnerHTML={{
                              __html: advice
                                .replace(/\*\*/g, "<strong>")
                                .replace(/\*/g, "")
                                .replace(/\n/g, "<br />"),
                            }}
                          />
                        </div>
                      ) : (
                        <div className="advice-content-wrapper">
                          <AntText type="secondary">
                            Không có lời khuyên nào được tạo. Bạn đã làm bài rất
                            tốt!
                          </AntText>
                        </div>
                      )}
                    </Panel>

                    {/* YouTube Videos */}
                    {Examresult.videos &&
                      typeof Examresult.videos === "object" &&
                      Examresult.videos !== null &&
                      Object.keys(Examresult.videos).length > 0 && (
                        <Panel
                          header={
                            <div className="panel-header-custom">
                              <YoutubeFilled className="panel-icon youtube" />
                              <span>Video gợi ý học tập</span>
                            </div>
                          }
                          key="videos"
                        >
                          <div className="videos-content">
                            {Object.entries(Examresult.videos).map(
                              ([topic, videos]: [string, any]) => {
                                if (
                                  !Array.isArray(videos) ||
                                  videos.length === 0
                                ) {
                                  return null;
                                }
                                return (
                                  <div
                                    key={topic}
                                    className="video-topic-section"
                                  >
                                    <Title level={5} className="topic-title">
                                      📚 {topic}
                                    </Title>
                                    <Row gutter={[16, 16]}>
                                      {videos.map((video: any, idx: number) => (
                                        <Col
                                          xs={24}
                                          sm={12}
                                          md={8}
                                          key={
                                            video.videoId ||
                                            `video-${topic}-${idx}`
                                          }
                                        >
                                          <a
                                            href={
                                              video.linkUrl ||
                                              `https://youtube.com/watch?v=${video.videoId}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="video-card-link"
                                          >
                                            <div className="video-thumbnail-wrapper">
                                              <img
                                                src={
                                                  video.thumbnail ||
                                                  `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`
                                                }
                                                alt={
                                                  video.title ||
                                                  "Video thumbnail"
                                                }
                                                className="video-thumb"
                                                onError={(e) => {
                                                  e.currentTarget.src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
                                                }}
                                              />
                                              <div className="play-overlay">
                                                <YoutubeFilled />
                                              </div>
                                            </div>
                                            <div className="video-info-box">
                                              <AntText className="video-title-text">
                                                {video.title ||
                                                  "Video không có tiêu đề"}
                                              </AntText>
                                            </div>
                                          </a>
                                        </Col>
                                      ))}
                                    </Row>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </Panel>
                      )}

                    {/* Suggested Questions */}
                    {suggestedQuestions && suggestedQuestions.length > 0 && (
                      <Panel
                        header={
                          <div className="panel-header-custom">
                            <QuestionCircleOutlined className="panel-icon" />
                            <span>Câu hỏi gợi ý luyện tập</span>
                          </div>
                        }
                        key="suggested"
                      >
                        <div className="suggested-questions-wrapper">
                          <Collapse
                            className="suggested-questions-collapse"
                            ghost
                            onChange={(key) => {
                              if (key && key.length > 0) {
                                const questionId = key[key.length - 1];
                                handleExpandSuggestedQuestion(
                                  questionId as string
                                );
                              }
                            }}
                          >
                            {suggestedQuestions.map(
                              (q: Question, id: number) => {
                                const cleanContent = (q.content || "")
                                  .replace(/<[^>]*>/g, "")
                                  .replace(/&nbsp;/g, " ")
                                  .trim();
                                return (
                                  <Panel
                                    header={
                                      <div className="question-header">
                                        <span className="question-number">
                                          Câu {id + 1}:
                                        </span>
                                        <span className="question-preview">
                                          {cleanContent.slice(0, 100)}
                                          {cleanContent.length > 100
                                            ? "..."
                                            : ""}
                                        </span>
                                      </div>
                                    }
                                    key={q._id ?? id}
                                    className="suggested-question-panel"
                                  >
                                    {q.loading ? (
                                      <div className="question-loading">
                                        <Spin />
                                        <AntText>Đang tải câu hỏi...</AntText>
                                      </div>
                                    ) : q.detailsFetched ? (
                                      <SuggestedQuestionAnswer question={q} />
                                    ) : (
                                      <div className="question-placeholder">
                                        <AntText type="secondary">
                                          Nhấp để xem chi tiết câu hỏi
                                        </AntText>
                                      </div>
                                    )}
                                  </Panel>
                                );
                              }
                            )}
                          </Collapse>
                        </div>
                      </Panel>
                    )}
                  </Collapse>
                )}
              </Card>
            </div>
          )}
        </Content>

        {/* Desktop Minimap - Fixed Right */}
        <div className="exam-minimap-fixed desktop-minimap">
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

        {/* Mobile Minimap - Fixed Bottom */}
        <div className="exam-minimap-mobile">
          <div className="mobile-minimap-content">
            <div className="mobile-timer">
              <ClockCircleOutlined />
              <span className={remainingTime <= 60 ? "critical" : ""}>
                {formatTime(remainingTime)}
              </span>
            </div>

            <Button
              type="primary"
              onClick={showSubmitModal}
              disabled={!!Examresult || loading}
              className="mobile-submit-btn"
            >
              <PlayCircleOutlined /> Nộp bài
            </Button>
          </div>

          {/* Expandable Question Map */}
          <Collapse
            ghost
            className="mobile-question-collapse"
            expandIconPosition="end"
          >
            <Panel header="Xem bản đồ câu hỏi" key="1">
              <div className="mobile-question-map">{renderQuestionMap()}</div>
            </Panel>
          </Collapse>
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
