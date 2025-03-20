import { useState, useEffect } from "react";
import {
  ExamAPI,
  ExamCopy,
  Question,
  QuestionAPI,
} from "@/services/teacher/Teacher";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Button,
  Tag,
  Collapse,
  Pagination,
  Select,
} from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import QuestionComponent from "@/pages/giaovien/QuanLyCauHoi/Question";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import UpdateExamModal from "./UpdateExam";
import "./index.css";
const { Search } = Input;
const { Panel } = Collapse;
const { Option } = Select;

export const UpdateExamQuestion = () => {
  const { _id } = useParams<{ _id: string }>();

  // State chính
  const [data, setData] = useState<Question[]>([]);
  const [otherQuestions, setOtherQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState<number>(1);
  const [total2, setTotal2] = useState<number>(1);
  const [easyLimit, setEasyLimit] = useState<number>(0);
  const [mediumLimit, setMediumLimit] = useState<number>(0);
  const [hardLimit, setHardLimit] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [examID, setExamID] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");

  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [bankPage, setBankPage] = useState<number>(1);
  const pageSize = 10;

  // Lấy danh sách câu hỏi từ API (1)
  const getAllQuestions = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestions(page);
      if (rq?.code === 200) {
        setTotal(rq.totalPage);
        setData((prev) => {
          const combined = [...prev, ...rq.questions];
          // Loại bỏ các câu hỏi trùng lặp theo _id
          const unique = Array.from(new Map(combined.map((q) => [q._id, q])).values());
          return unique;
        });
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  // Lấy danh sách câu hỏi từ API (2)
  const getAllQuestions2 = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestionsBlank(page);
      if (rq?.code === 200) {
        setData((prev) => {
          const combined = [...prev, ...rq.questions];
          const unique = Array.from(new Map(combined.map((q) => [q._id, q])).values());
          return unique;
        });
        setTotal2(rq.totalPage);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  // Load dữ liệu ban đầu và các trang tiếp theo nếu có
  useEffect(() => {
    getAllQuestions(1);
    getAllQuestions2(1);
    addSeletedQuestion();
  }, []);

  useEffect(() => {
    if (total > 1) {
      Promise.all(
        Array.from({ length: total - 1 }, (_, i) => getAllQuestions(i + 2))
      );
    }
  }, [total]);

  useEffect(() => {
    if (total2 > 1) {
      Promise.all(
        Array.from({ length: total2 - 1 }, (_, i) => getAllQuestions2(i + 2))
      );
    }
  }, [total2]);

  // Cập nhật danh sách câu hỏi chưa chọn
  useEffect(() => {
    setOtherQuestions(
      data.filter((q) => !selectedQuestions.some((sq) => sq._id === q._id))
    );
  }, [selectedQuestions, data]);

  // Lấy danh sách câu hỏi đã có của đề thi
  const addSeletedQuestion = async () => {
    if (!_id) {
      console.error("Không tìm thấy id");
      return;
    }
    const rq = await ExamAPI.getDetailExam(_id);
    if (rq?.success) {
      setSelectedQuestions(rq.data.questions || []);
      setExamID(rq.data._id);
    }
  };

  // Hàm trộn mảng (shuffle)
  const shuffleArray = (array: Question[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Tự động thêm câu hỏi theo số lượng yêu cầu cho từng mức
  const handleOk = () => {
    const easyQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "easy")
    ).slice(0, easyLimit);
    const mediumQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "medium")
    ).slice(0, mediumLimit);
    const hardQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "hard")
    ).slice(0, hardLimit);

    setSelectedQuestions((prev) => [
      ...prev,
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions,
    ]);

    setOtherQuestions((prev) =>
      prev.filter(
        (q) =>
          !easyQuestions.some((eq) => eq._id === q._id) &&
          !mediumQuestions.some((mq) => mq._id === q._id) &&
          !hardQuestions.some((hq) => hq._id === q._id)
      )
    );

    setOpenModal(false);
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  // Hàm di chuyển câu hỏi giữa danh sách được chọn và chưa chọn
  const moveQuestion = (question: Question) => {
    if (selectedQuestions.some((q) => q._id === question._id)) {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q._id !== question._id)
      );
      setOtherQuestions((prev) => {
        if (!prev.some((q) => q._id === question._id)) {
          return [...prev, question];
        }
        return prev;
      });
    } else {
      setOtherQuestions((prev) => prev.filter((q) => q._id !== question._id));
      setSelectedQuestions((prev) => {
        if (!prev.some((q) => q._id === question._id)) {
          return [...prev, question];
        }
        return prev;
      });
    }
  };

  const copyExam = async () => {
    if (!_id) {
      alert("Không tìm thấy id");
      return;
    }
    const examCopy: ExamCopy = { examId: examID };
    const rq = await ExamAPI.copyExam(examCopy);
    if (rq?.success) {
      alert("Sao chép đề thi thành công");
    } else {
      alert("Sao chép đề thi thất bại");
    }
  };

  const filteredOtherQuestions = otherQuestions.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.content.toLowerCase().includes(term) ||
      (q.knowledge && q.knowledge.toLowerCase().includes(term)) ||
      (q.subject && q.subject.toLowerCase().includes(term));
    const matchesType = filterType
      ? q.questionType?.toLowerCase() === filterType.toLowerCase()
      : true;
    const matchesLevel = filterLevel
      ? q.level?.toLowerCase() === filterLevel.toLowerCase()
      : true;
    return matchesSearch && matchesType && matchesLevel;
  });

  // Phân trang cho các danh sách
  const paginatedSelectedQuestions = selectedQuestions.slice(
    (selectedPage - 1) * pageSize,
    selectedPage * pageSize
  );
  const paginatedBankQuestions = filteredOtherQuestions.slice(
    (bankPage - 1) * pageSize,
    bankPage * pageSize
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="default" onClick={() => setOpenModal(true)}>
          Thêm câu hỏi tự động từ ngân hàng của bạn
        </Button>
        <Button
          type="default"
          onClick={() => {
            if (selectedQuestions.length > 0) {
              setOpenModalCreate(true);
            } else {
              alert("Chưa có câu hỏi nào");
            }
          }}
          style={{ marginLeft: 8 }}
        >
          Sửa đề thi
        </Button>
        <Button
          type="default"
          onClick={() => {
            if (selectedQuestions.length > 0) {
              copyExam();
            } else {
              alert("Chưa có câu hỏi nào");
            }
          }}
          style={{ marginLeft: 8 }}
        >
          Sao chép đề thi
        </Button>
      </div>

      {/* --- Danh sách câu hỏi trong đề thi (không dùng panel) --- */}
      <h3>Danh sách câu hỏi trong đề thi</h3>
      {selectedQuestions && selectedQuestions.length > 0 ? (
        <>
          {paginatedSelectedQuestions.map((question, index) => (
            <div
              key={question._id || index}
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>
                  {index + 1 + (selectedPage - 1) * pageSize}.{" "}
                  {question.content.length > 200
                    ? question.content.slice(0, 200) + " ..."
                    : question.content}
                </strong>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Tag
                  color={clsx(
                    question.level === "easy" && "green",
                    question.level === "medium" && "yellow",
                    question.level === "hard" && "red"
                  )}
                >
                  {question.level}
                </Tag>
                <Tag color="blue">{question.subject}</Tag>
                <Tag color="cyan">{question.knowledge}</Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Button
                  size="large"
                  onClick={() => moveQuestion(question)}
                  icon={<MinusOutlined style={{ color: "red" }} />}
                >
                  Gỡ
                </Button>
              </div>
              <QuestionComponent
                deletetalbe={false}
                question={question}
                onUpdateSuccess={() => {}}
                questionType={question.questionType || ""}
              />
            </div>
          ))}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Pagination
              current={selectedPage}
              pageSize={pageSize}
              total={selectedQuestions.length}
              onChange={(page) => setSelectedPage(page)}
            />
          </div>
        </>
      ) : (
        <p>Chưa có câu hỏi nào được chọn.</p>
      )}

      <h3>Ngân hàng câu hỏi</h3>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div className="search-filter-container">
  <Search
    placeholder="Tìm theo nội dung, kiến thức, chủ đề"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    enterButton
    className="search-input"
  />
  <Select
    placeholder="Loại câu hỏi"
    allowClear
    className="select-item"
    value={filterType || undefined}
    onChange={(value) => setFilterType(value)}
  >
    <Option value="6742fb1cd56a2e75dbd817ea">Yes/No</Option>
    <Option value="6742fb3bd56a2e75dbd817ec">Điền khuyết</Option>
  </Select>
  <Select
    placeholder="Mức độ"
    allowClear
    className="select-item"
    value={filterLevel || undefined}
    onChange={(value) => setFilterLevel(value)}
  >
    <Option value="easy">Easy</Option>
    <Option value="medium">Medium</Option>
    <Option value="hard">Hard</Option>
  </Select>
</div>

      </div>
      {filteredOtherQuestions && filteredOtherQuestions.length > 0 ? (
        <>
          <Collapse accordion>
            {paginatedBankQuestions.map((question, index) => (
              <Panel
                header={
                  <div>
                    <strong>
                      {index + 1 + (bankPage - 1) * pageSize}.{" "}
                      {question.content.length > 200
                        ? question.content.slice(0, 200) + " ..."
                        : question.content}
                    </strong>
                  </div>
                }
                key={question._id || index}
              >
                <div style={{ marginBottom: 8 }}>
                  <button
                    className="btn"
                    onClick={() => moveQuestion(question)}
                  >
                    <PlusOutlined style={{ color: "green" }} /> Thêm
                  </button>
                </div>
                <QuestionComponent
                  deletetalbe={false}
                  question={question}
                  onUpdateSuccess={() => {}}
                  questionType={question.questionType || ""}
                />
              </Panel>
            ))}
          </Collapse>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Pagination
              current={bankPage}
              pageSize={pageSize}
              total={filteredOtherQuestions.length}
              onChange={(page) => setBankPage(page)}
            />
          </div>
        </>
      ) : (
        <p>Không có câu hỏi phù hợp.</p>
      )}

      <Modal
        open={openModal}
        title="Thêm câu hỏi tự động"
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Đóng"
      >
        <Form layout="vertical">
          <Form.Item
            label={`Số câu dễ (còn lại: ${otherQuestions.filter(
              (q) => q.level === "easy"
            ).length})`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "easy").length}
              value={easyLimit}
              onChange={(value) => {
                if (value !== null) setEasyLimit(value);
              }}
            />
          </Form.Item>
          <Form.Item
            label={`Số câu trung bình (còn lại: ${otherQuestions.filter(
              (q) => q.level === "medium"
            ).length})`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "medium").length}
              value={mediumLimit}
              onChange={(value) => {
                if (value !== null) setMediumLimit(value);
              }}
            />
          </Form.Item>
          <Form.Item
            label={`Số câu khó (còn lại: ${otherQuestions.filter(
              (q) => q.level === "hard"
            ).length})`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "hard").length}
              value={hardLimit}
              onChange={(value) => {
                if (value !== null) setHardLimit(value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <UpdateExamModal
        id={_id || ""}
        visible={openModalCreate}
        handleClose={() => setOpenModalCreate(false)}
        onCreateSuccess={() => setOpenModalCreate(false)}
        dataQuestion={selectedQuestions}
      />
    </div>
  );
};
