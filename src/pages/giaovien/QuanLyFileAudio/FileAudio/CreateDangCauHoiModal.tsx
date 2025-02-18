import React, { useState } from "react";
import { Modal, Input, Form } from "antd";
import { Audio, AudioAPI } from "@/services/teacher/Teacher";

interface CreateAudioProps {
  visible: boolean;
  handleClose: () => void;
  onAudioCreated?: (audioId: string) => void;
}

export const CreateAudioModal: React.FC<CreateAudioProps> = ({
  visible,
  handleClose,
  onAudioCreated,
}) => {
  const [question, setQuestion] = useState<Audio>({
    filePath: "",
    description: "",
    transcription: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      if (!["audio/mp3", "audio/wav", "audio/mpeg"].includes(selectedFile.type)) {
        alert("Chỉ chấp nhận các file âm thanh định dạng .mp3 hoặc .wav");
        return;
      }
      setQuestion((prev) => ({ ...prev, filePath: selectedFile }));
    }
  };

  const handleSaveClick = async () => {
    if (!question.filePath) {
      alert("Vui lòng chọn file audio để upload");
      return;
    }
    if (question.description.trim() === "") {
      alert("Vui lòng nhập mô tả file nghe");
      return;
    }
    if (question.transcription.trim() === "") {
      alert("Vui lòng nhập dịch file nghe");
      return;
    }

    const formData = new FormData();
    formData.append("filePath", question.filePath);
    formData.append("description", question.description);
    formData.append("transcription", question.transcription);

    const rq = await AudioAPI.createAudio(formData as unknown as Audio);
    if (rq.success) {
      console.log("Audio created", rq);
      console.log(rq.data._id);
      onAudioCreated?.(rq.data._id);
      saveAudio();
    } else {
      console.log(rq.message);
    }
  };

  const saveAudio = () => {
    setQuestion({
      filePath: '',
      description: "",
      transcription: "",
    });
   
    handleClose();
  };

  return (
    <Modal
      title="Thêm file nghe"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Upload Audio File">
          <input type="file" accept="audio/*" onChange={handleFileChange} />
          {question.filePath && <p>Tệp đã chọn: {question.filePath.name}</p>}
        </Form.Item>
        <Form.Item label="Tên file nghe">
          <Input.TextArea
            name="description"
            value={question.description}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Transcription">
          <Input.TextArea
            name="transcription"
            value={question.transcription}
            onChange={handleChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
