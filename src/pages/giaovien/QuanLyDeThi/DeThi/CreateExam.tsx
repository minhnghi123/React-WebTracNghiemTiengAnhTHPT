import React, { useState } from "react";
import { Modal, Input, Select, Form, message, DatePicker } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Exam, ExamAPI } from "@/services/teacher/Teacher";

const { Option } = Select;

interface CreateExamModalProps {
  visible: boolean;
  handleClose: () => void;
  onCreateSuccess: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  visible,
  handleClose,
  onCreateSuccess,
}) => {
  const [exam, setExam] = useState<Partial<Exam>>({
    title: "",
    description: "",
    questions: [],
    duration: 90,
    startTime: new Date(),
    endTime: undefined,
    isPublic: false,
    slug: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: boolean) => {
    setExam((prev) => ({ ...prev, isPublic: value }));
  };

  const handleDateChange = (name: string, date: any) => {
    setExam((prev) => ({ ...prev, [name]: date }));
  };

  const handleSaveClick = async () => {
    try {
      const response = await ExamAPI.creteExam(exam as Exam);
      if (response?.code === 200) {
        message.success("Tạo đề thi thành công");
        handleClose();
        onCreateSuccess();
      } else {
        message.error("Failed to create exam.");
      }
    } catch (error) {
      message.error("An error occurred while creating the exam.");
    }
  };

  return (
    <Modal
      title="Tạo kỳ thi"
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
          <Input.TextArea
            name="description"
            value={exam.description}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="Thời gian (phút)">
          <Input
            name="duration"
            type="number"
            value={exam.duration}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="Thời gian bắt đầu">
          <DatePicker
            showTime
            onChange={(date) => handleDateChange("startTime", date)}
          />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc">
          <DatePicker
            showTime
            onChange={(date) => handleDateChange("endTime", date)}
          />
        </Form.Item>
        <Form.Item label="Công khai">
          <Select value={exam.isPublic} onChange={handleSelectChange}>
            <Option value={true}>Công khai</Option>
            <Option value={false}>Riêng</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExamModal;
