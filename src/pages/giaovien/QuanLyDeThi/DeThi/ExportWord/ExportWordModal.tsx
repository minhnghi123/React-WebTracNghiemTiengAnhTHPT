import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Button } from "antd";
import { ExamDataExport, ExportAPI } from "@/services/teacher/ExportImport";
import { Exam, ExamAPI, Question } from "@/services/teacher/Teacher";

interface ExportWordModalProps {
  visible: boolean;
  handleClose: () => void;
  examId: string;
}

const ExportWordModal: React.FC<ExportWordModalProps> = ({ visible, handleClose, examId }) => {
  

  const [examData, setExamData] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [code, setCode] = useState("");
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState("");

  useEffect(() => {
    const fetchExamData = async () => {
      const response = await ExamAPI.getDetailExam(examId);
      setExamData(response.data);
    };

    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const handleExport = async () => {
    try {
      if(!examData) {
        throw new Error("Không tìm thấy dữ liệu đề thi");
      }
      // Chuyển đổi câu hỏi thành cấu trúc ExamDataExport
    const exportData: ExamDataExport = {
      title,
      description,
      school,
      department,
      subject,
      teacher,
      code,
      duration,
      comments,

      // Câu hỏi dạng nhiều lựa chọn (Multichoice)
      questionsMultichoice: examData.questions
        .filter(
          (q): q is Question =>
            typeof q !== "string" &&
            q.questionType === "6742fb1cd56a2e75dbd817ea" &&
            !q.audio
        )
        .map((q) => ({
          content: q.content,
          answers: q.answers.map((answer) => ({
            text: answer.text,
            isCorrect: answer.isCorrect,
          })),
        })),

      // Câu hỏi điền khuyết (Fill in the Blank)
      questionsFillInBlank: examData.questions
        .filter(
          (q): q is Question =>
            typeof q !== "string" &&
            q.questionType === "6742fb3bd56a2e75dbd817ec"
        )
        .map((q) => ({
          content: q.content,
        })),

      // Câu hỏi nghe (Listening)
      questionsListening: examData.questions
        .filter(
          (q): q is Question =>
            typeof q !== "string" &&
            q.questionType === "6742fb1cd56a2e75dbd817ea" &&
            !!q.audio
        )
        .map((q) => ({
          transcript: q.audioInfo?.transcription || "",
          audio: q.audioInfo?.filePath || "",
          questions: q.answers.map((answer) => ({
            content: answer.text,
            isCorrect: answer.isCorrect,
            answers: q.answers.map((ans) => ({
              text: ans.text,
              isCorrect: ans.isCorrect,
            })),
          })),
        })),
    };

      await ExportAPI.exportWord(exportData);
      alert("Xuất file Word thành công!");
      handleClose();
    } catch (error) {
      console.error("Lỗi khi xuất file Word:", error);
      alert("Xuất file Word thất bại!");
    }
  };

  return (
    <Modal
      title="Xuất đề thi ra file Word"
      visible={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button key="export" type="primary" onClick={handleExport}>
          Xuất
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Tiêu đề">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="Mô tả">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.Item>
        <Form.Item label="Trường">
          <Input value={school} onChange={(e) => setSchool(e.target.value)} />
        </Form.Item>
        <Form.Item label="Khoa">
          <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
        </Form.Item>
        <Form.Item label="Môn học">
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Form.Item>
        <Form.Item label="Giáo viên">
          <Input value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        </Form.Item>
        <Form.Item label="Mã đề thi">
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </Form.Item>
        <Form.Item label="Thời gian (phút)">
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </Form.Item>
        <Form.Item label="Ghi chú">
          <Input value={comments} onChange={(e) => setComments(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportWordModal;
