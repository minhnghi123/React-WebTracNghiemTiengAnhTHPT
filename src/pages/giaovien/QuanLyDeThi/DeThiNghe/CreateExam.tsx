import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Form, Button, DatePicker, message } from "antd";
import { ExamListeningQuestionAPI, ListeningExamData } from "@/services/teacher/ListeningQuestion";
import { AudioAPI, Audio } from "@/services/teacher/Teacher";
import { CreateAudioModal } from "../../QuanLyFileAudio/FileAudio/CreateDangCauHoiModal";
import moment from "moment";

const { Option } = Select;

interface CreateExamModalProps {
  visible: boolean;
  handleClose: () => void;
  onCreateSuccess: () => void;
  teacherId: string;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  visible,
  handleClose,
  onCreateSuccess,
  teacherId,
}) => {
  const [exam, setExam] = useState<Partial<ListeningExamData>>({
    teacherId: teacherId,
    title: "",
    description: "",
    audio: "",
    questions: [],
    duration: 90,
    isPublic: false,
    startTime: undefined,
    endTime: undefined,
  });

  const [existingAudios, setExistingAudios] = useState<Audio[]>([]);
  const [isCreateAudioModalVisible, setIsCreateAudioModalVisible] = useState<boolean>(false);

  const fetchAudios = async () => {
    try {
      const response = await AudioAPI.getAllAudio();
      setExistingAudios(response);
    } catch (error) {
      console.error("Error fetching audios:", error);
    }
  };

  useEffect(() => {
    fetchAudios();
  }, []);

  const handleAudioCreated = (audioId: string) => {
    setExam((prev) => ({ ...prev, audio: audioId }));
    setIsCreateAudioModalVisible(false);
    fetchAudios();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: any) => {
    setExam((prev) => ({ ...prev, [name]: value ? value.toISOString() : null }));
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
      questions: exam.questions || [],
      duration: Number(exam.duration) || 90,
      startTime: exam.startTime || new Date(),
      endTime: exam.endTime || new Date(new Date(exam.startTime!).getTime() + 90 * 60 * 1000),
      isPublic: exam.isPublic || false,
    };

    try {
      const response = await ExamListeningQuestionAPI.createListeningExam(formattedExam);
      if (response?.data) {
        Modal.success({
          title: "Thành công",
          content: "Bài kiểm tra đã được tạo thành công!",
        });
        handleClose();
        onCreateSuccess();
      } else {
        Modal.error({
          title: "Lỗi",
          content: "Có lỗi xảy ra khi tạo bài kiểm tra.",
        });
      }
    } catch (error: any) {
      Modal.error({
        title: "Lỗi",
        content: error.response?.data?.message || "Có lỗi xảy ra khi tạo bài kiểm tra.",
      });
    }
  };

  return (
    <Modal
      title="Tạo bài kiểm tra nghe"
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
          <Button type="dashed" onClick={() => setIsCreateAudioModalVisible(true)}>
            Tạo file nghe mới
          </Button>
          <Select
            placeholder="Hoặc chọn audio có sẵn"
            value={exam.audio}
            onChange={(value) => setExam((prev) => ({ ...prev, audio: value }))}
            style={{ width: "100%", marginTop: "10px" }}
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
            onChange={(value) => handleDateChange("startTime", value)}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc">
          <DatePicker
            showTime
            value={exam.endTime ? moment(exam.endTime) : null}
            onChange={(value) => handleDateChange("endTime", value)}
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

      <CreateAudioModal
        visible={isCreateAudioModalVisible}
        handleClose={() => setIsCreateAudioModalVisible(false)}
        onAudioCreated={handleAudioCreated}
      />
    </Modal>
  );
};

export default CreateExamModal;