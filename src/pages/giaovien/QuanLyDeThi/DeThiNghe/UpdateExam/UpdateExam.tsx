import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Form, DatePicker, message } from "antd";
import { ExamListeningQuestionAPI, ListeningExamData, ListeningQuestion } from "@/services/teacher/ListeningQuestion";
import { AudioAPI, Audio } from "@/services/teacher/Teacher";
import moment from "moment";
import { useAuthContext } from "@/contexts/AuthProvider";

const { Option } = Select;

interface UpdateExamModalProps {
  visible: boolean;
  handleClose: () => void;
  onUpdateSuccess: () => void;
  examData: ListeningExamData;
  dataQuestion: ListeningQuestion[];
}

const UpdateExamModal: React.FC<UpdateExamModalProps> = ({
  visible,
  handleClose,
  onUpdateSuccess,
  examData,
  dataQuestion,
}) => {
  const [exam, setExam] = useState<Partial<ListeningExamData>>(examData || {});
  const [existingAudios, setExistingAudios] = useState<Audio[]>([]);
  const {user} = useAuthContext() 
  
  const fetchAudios = async () => {
    try {
      const response = await AudioAPI.getAllAudio();
      setExistingAudios(response);
    } catch (error) {
      console.error("Error fetching audios:", error);
    }
  };

  useEffect(() => {
    setExam(examData || {});
    fetchAudios();
  }, [examData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: any) => {
    setExam((prev) => ({ ...prev, [name]: date ? date.toISOString() : null }));
  };

  const handleSaveClick = async () => {
    if (!exam.startTime) {
      message.error("Vui lòng chọn thời gian bắt đầu.");
      return;
    }

    if (exam.endTime && new Date(exam.endTime) <= new Date(exam.startTime)) {
      message.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      return;
    }
    const formattedExam: ListeningExamData = {
      teacherId: exam.teacherId || "",
      title: exam.title || "",
      description: exam.description || "",
      audio: exam.audio || "",
      questions: exam.questions || dataQuestion.map((q) => q.id) as string[],
      duration: Number(exam.duration) || 90,
      startTime: exam.startTime || new Date(),
      endTime: exam.endTime || new Date(new Date(exam.startTime!).getTime() + 90 * 60 * 1000),
      isPublic: exam.isPublic || false,
    };
    try {
      const response = await ExamListeningQuestionAPI.updateListeningExam(exam.id!,user?._id, formattedExam);
      if (response?.data) {
        message.success("Bài kiểm tra đã được cập nhật thành công!");
        handleClose();
        onUpdateSuccess();
      } else {
        message.error("Có lỗi xảy ra khi cập nhật bài kiểm tra.");
      }
    } catch (error: any) {
      console.log(error)
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài kiểm tra.");
    }
  };

  return (
    <Modal
      title="Cập nhật bài kiểm tra nghe"
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
        <Form.Item label="Audio">
          <Select
            placeholder="Chọn audio"
            value={exam.audio}
            onChange={(value) => setExam((prev) => ({ ...prev, audio: value }))}
            style={{ width: "100%" }}
          >
            {existingAudios.map((audio) => (
              <Option key={audio._id} value={audio._id}>
                {audio.description}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Thời gian (phút)">
          <Input name="duration" type="number" value={exam.duration} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Thời gian bắt đầu">
          <DatePicker
            showTime
            value={exam.startTime ? moment(exam.startTime) : null}
            onChange={(date) => handleDateChange("startTime", date)}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc">
          <DatePicker
            showTime
            value={exam.endTime ? moment(exam.endTime) : null}
            onChange={(date) => handleDateChange("endTime", date)}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Trạng thái">
          <Select
            value={exam.isPublic}
            onChange={(value) => handleSelectChange("isPublic", value)}
          >
            <Option value={true}>Công khai</Option>
            <Option value={false}>Riêng tư</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateExamModal;