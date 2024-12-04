import React, { useState } from "react";
import { Modal, Input, Form } from "antd";
import { AudioAPI } from "@/services/teacher/Teacher";

interface Audio {
  filePath: string;
  description: string;
  transcription: string;
}

interface CreateAudioProps {
  visible: boolean;
  handleClose: () => void;
}

export const CreateAudioModal: React.FC<CreateAudioProps> = ({
  visible,
  handleClose,
}) => {
  const [question, setQuestion] = useState<Audio>({
    filePath: "",
    description: "",
    transcription: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (info: any) => {
  //   const file = info.file.originFileObj;
  //   if (file) {
  //     console.log("123");
  //     if (!["audio/mp3", "audio/wav", "audio/mpeg"].includes(file.type)) {
  //       alert("Chỉ chấp nhận các file âm thanh định dạng .mp3 hoặc .wav");
  //       return;
  //     }

  //     setFile(file);

  //     // Convert file to base64 and store in localStorage
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const filePath = `local-audio-${file.name}`;
  //       const base64Content = reader.result as string;

  //       setQuestion((prev) => ({ ...prev, filePath }));
  //       localStorage.setItem(filePath, base64Content); // Store base64 content
  //       console.log(`File "${file.name}" đã lưu vào localStorage.`);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  //   console.log(file);
  // };
  // const props: UploadProps = {
  //   name: "file",
  //   multiple: true,
  //   action: "",
  //   onChange(info) {
  //     const { status } = info.file;
  //     if (status !== "uploading") {
  //       console.log(info.file, info.fileList);
  //     }
  //     if (status === "done") {
  //       message.success(`${info.file.name} file uploaded successfully.`);
  //     } else if (status === "error") {
  //       message.error(`${info.file.name} file upload failed.`);
  //     }
  //   },
  //   onDrop(e) {
  //     console.log("Dropped files", e.dataTransfer.files);
  //   },
  // };
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
    const rq = await AudioAPI.createAudio(question);
    if (rq.success) {
      saveAudio();
    } else console.log(rq.message);
  };

  const saveAudio = () => {
    //console.log("Lưu thông tin file nghe:", audio);

    // Reset state after saving
    setQuestion({
      filePath: "",
      description: "",
      transcription: "",
    });
    setFile(null);
    alert("File nghe đã được lưu tạm thời trên FE.");
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
      {/* <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click hoặc kéo thả file audio vào đây để upload
        </p>
        <p className="ant-upload-hint">
          Hỗ trợ upload file âm thanh định dạng .mp3 hoặc .wav
        </p>
      </Dragger> */}
      <Form layout="vertical">
        <Form.Item label="Upload Audio File">
          {file && <p>Tệp đã chọn: {file.name}</p>}
        </Form.Item>
        <Form.Item label="Đường dẫn file nghe">
          <Input
            name="filePath"
            value={question.filePath}
            onChange={handleChange}
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
