import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Form, Button } from "antd";
import { ExamListeningQuestionAPI, ListeningExamData, ListeningQuestion } from "@/services/teacher/ListeningQuestion";
import { AudioAPI, Audio } from "@/services/teacher/Teacher";
import { CreateAudioModal } from "@/pages/giaovien/QuanLyFileAudio/FileAudio/CreateDangCauHoiModal";
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
    setExam(examData || {});
    fetchAudios();
  }, [examData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setExam(prev => ({ ...prev, [name]: value }));
  };

  const handleAudioCreated = (audioId: string) => {
    setExam(prev => ({ ...prev, audio: audioId }));
    setIsCreateAudioModalVisible(false);
    fetchAudios();
  };

  const handleSaveClick = async () => {
    const formattedExam: ListeningExamData = {
      teacherId: exam.teacherId || "",
      title: exam.title || "",
      description: exam.description || "",
      audio: exam.audio || "",
      questions: exam.questions || dataQuestion.map(q => q.id) as string[],
      duration: Number(exam.duration) || 90,
      difficulty: exam.difficulty as "easy" | "medium" | "hard",
      passingScore: Number(exam.passingScore) || 50,
      isPublished: exam.isPublished,
    };

    try {
      const response = await ExamListeningQuestionAPI.updateListeningExam(exam.id!, formattedExam);
      if (response?.data) {
        Modal.success({
          title: "Thành công",
          content: "Bài kiểm tra đã được cập nhật thành công!",
        });
        handleClose();
        onUpdateSuccess();
      } else {
        Modal.error({
          title: "Lỗi",
          content: "Có lỗi xảy ra khi cập nhật bài kiểm tra.",
        });
      }
    } catch (error: any) {
      Modal.error({
        title: "Lỗi",
        content: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài kiểm tra.",
      });
    }
  };
  console.log(exam);
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
            <Button type="dashed" onClick={() => setIsCreateAudioModalVisible(true)}>
              Tạo file nghe mới
            </Button>
            <Select
              placeholder="Hoặc chọn audio có sẵn"
              value={typeof exam.audio === 'object' ? (exam.audio.description? exam.audio.description : exam.audio._id) : exam.audio}
              onChange={(value) => setExam(prev => ({ ...prev, audio: value }))}
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
        <Form.Item label="Độ khó">
          <Select value={exam.difficulty} onChange={(value) => handleSelectChange("difficulty", value)}>
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Điểm qua">
          <Input name="passingScore" type="number" value={exam.passingScore} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Phát hành">
          <Select value={exam.isPublished} onChange={(value) => handleSelectChange("isPublished", value)}>
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

export default UpdateExamModal;
