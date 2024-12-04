import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Audio, AudioAPI } from "@/services/teacher/Teacher";

interface UpdateAudioProps {
  visible: boolean;
  handleClose: () => void;
  audioData: Audio;
}

export const UpdateAudioModal: React.FC<UpdateAudioProps> = ({
  visible,
  handleClose,
  audioData,
}) => {
  const [question, setQuestion] = useState<Audio>(audioData);
  //const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setQuestion(audioData);
  }, [audioData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj;
    console.log(file);
    if (file) {
      //setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const filePath = `../Audio/${file.name}`; // Path at the same level as 'src'
        setQuestion((prev) => ({ ...prev, filePath }));
        // Simulate saving the file locally
        localStorage.setItem(filePath, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    if (question.description === "") {
      alert("Vui lòng nhập mô tả file nghe");
      return;
    }
    if (question.transcription === "") {
      alert("Vui lòng nhập dịch file nghe");
      return;
    }

    updateQuestion(question);
  };

  const updateQuestion = async (q: Audio) => {
    try {
      const rq = await AudioAPI.updateAudio(q, q._id ?? "");
      if (rq?.success) {
        alert("Cập nhật file nghe thành công");
        handleClose();
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  return (
    <Modal
      title="Cập nhật file nghe"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Upload Audio File">
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Đường dẫn file nghe">
          <Input
            name="filePath"
            value={question.filePath}
            onChange={handleChange}
            required
            disabled
          />
        </Form.Item>
        <Form.Item label="Tên file nghe">
          <Input.TextArea
            name="description"
            value={question.description}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Mô tả">
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
