import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Form, DatePicker, message } from "antd";
import { Exam, ExamAPI, Question } from "@/services/teacher/Teacher";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { ExamDataRecieve } from "@/services/teacher/ListeningQuestion";

const { Option } = Select;

interface UpdateExamModalProps {
  visible: boolean;
  handleClose: () => void;
  onCreateSuccess: () => void;
  dataQuestion: Question[];
  listeningExams: ExamDataRecieve[];
  slug: string;
}

const UpdateExamModal: React.FC<UpdateExamModalProps> = ({
  visible,
  handleClose,
  onCreateSuccess,
  dataQuestion,
  listeningExams,
  slug,
}) => {
  const [exam, setExam] = useState<Exam>({
    title: "",
    description: "",
    questions: dataQuestion || [],
    listeningExams: listeningExams || [],
    duration: 90,
    startTime: new Date(),
    endTime: undefined,
    isPublic: false,
    slug: "",
    createdAt: new Date(),
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: boolean) => {
    setExam((prev) => ({ ...prev, isPublic: value }));
  };

  const handleDateChange = (name: string, date: any) => {
    setExam((prev) => ({ ...prev, [name]: date }));
  };

  useEffect(() => {
    const fetchExamDetails = async () => {
      if (slug) {
        const response = await ExamAPI.getDetailExam(slug);
        if (response?.success === true) {
          setExam(response.data);
          setExam((prev) => ({
            ...prev,
            startTime: new Date(response.data.startTime),
            endTime: response.data.endTime ? new Date(response.data.endTime) : undefined,
            questions: dataQuestion || [],
            listeningExams: listeningExams || [],
          }));
        } else {
          console.log(response);
        }
      }
    };

    fetchExamDetails();
  }, [slug, dataQuestion, listeningExams]);

  const handleSaveClick = async () => {
    if (!exam.startTime) {
      alert("Vui lòng chọn thời gian bắt đầu ");
      return;
    }

    if (exam.endTime && exam.endTime <= exam.startTime) {
      alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      return;
    }
    const response = await ExamAPI.UpdateExam(exam as Exam, slug);
    if (response?.success === true) {
      alert("Sửa đề thi thành công");
      navigate("/giaovien/QuanLyDeThi/");
      handleClose();
      onCreateSuccess();
    } else {
      message.error(response?.message);
    }
  };

  const navigate = useNavigate();

  return (
    <Modal
      title="Sửa kỳ thi"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Tiêu đề">
          <Input name="title" value={exam.title} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Mô tả">
          <Input.TextArea name="description" value={exam.description} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Thời gian (phút)">
          <Input name="duration" type="number" value={exam.duration} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Thời gian bắt đầu">
          <DatePicker
            showTime
            value={exam.startTime ? moment(exam.startTime) : null}
            onChange={(date) => handleDateChange("startTime", date)}
          />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc">
          <DatePicker
            showTime
            value={exam.endTime ? moment(exam.endTime) : null}
            onChange={(date) => handleDateChange("endTime", date)}
          />
        </Form.Item>
        <Form.Item label="Công khai">
          <Select value={exam.isPublic} onChange={handleSelectChange}>
            <Option value={true}>Công khai</Option>
            <Option value={false}>Riêng tư</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateExamModal;
