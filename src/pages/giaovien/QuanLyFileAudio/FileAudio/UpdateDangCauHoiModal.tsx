import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Audio, AudioAPI } from "@/services/teacher/Teacher";
import createTranscription from "@/services/GropApi/createTranscription";

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

  const handleSubmit = async () => {
    const allowedFileTypes = ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'opus', 'wav', 'webm'];
  
    if (!question.filePath) {
      console.error('Please select an audio file');
      return;
    }
  
    try {
      const response = await fetch(question.filePath);
      const blob = await response.blob();
      const file = new File([blob], 'audio.mp3', { type: blob.type });
  
      const fileType = file.name.split('.').pop();
  
      if (!fileType || !allowedFileTypes.includes(fileType)) {
        console.error('File must be one of the following types: [flac, mp3, mp4, mpeg, mpga, m4a, ogg, opus, wav, webm]');
        return;
      }
  
      try {
        const transcriptionResponse = await createTranscription({ file });
        setQuestion((prev) => ({ ...prev, transcription: transcriptionResponse as string }));
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
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
          <div className="d-flex">
            <Input.TextArea
            name="transcription"
            value={question.transcription}
              onChange={handleChange}
              style={{ width: "95% " }}
            />
            <div className=" align-items-center d-flex flex-column justify-content-center">
              <Button
                type="link"
                icon={
                  <img
                    src="/src/Content/img/Google_Translate_Icon.png"
                    height="16px"
                  />
                }
                onClick={() => handleSubmit()}
                style={{ color: "#FF0000" }}
              />
            </div>
          </div>
          </Form.Item>
      </Form>
    </Modal>
  );
};