import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Button } from "antd";
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
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setQuestion(audioData);
  }, [audioData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  // Phần xử lý file giống như ở create
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      // Kiểm tra định dạng file
      if (
        !["audio/mp3", "audio/wav", "audio/mpeg"].includes(selectedFile.type)
      ) {
        alert("Chỉ chấp nhận các file âm thanh định dạng .mp3 hoặc .wav");
        return;
      }
      setFile(selectedFile);
      setQuestion((prev) => ({ ...prev, filePath: selectedFile }));
    }
  };

  const handleSaveClick = async () => {
    if (question.description.trim() === "") {
      alert("Vui lòng nhập mô tả file nghe");
      return;
    }

    // Tạo FormData để gửi dữ liệu update (bao gồm cả file nếu có)
    const formData = new FormData();
    if (file !== null) {
      console.log("file", file);
      formData.append("filePath", file); 
    }
    formData.append("description", question.description);
    formData.append("transcription", question.transcription);

    updateQuestion(formData);
  };

  const updateQuestion = async (formData: FormData) => {
    try {
      const rq = await AudioAPI.updateAudio(formData as unknown as Audio, question._id ?? "");
      if (rq?.success) {
        console.log(rq);
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
    const allowedFileTypes = ["mp3", "mp4"];

    let fileToUse: File | null = file;
    if (
      !fileToUse &&
      typeof question.filePath === "string" &&
      question.filePath
    ) {
      try {
        const response = await fetch(question.filePath);
        const blob = await response.blob();
        fileToUse = new File([blob], "audio.mp3", { type: blob.type });
      } catch (err) {
        console.error("Lỗi", err);
        return;
      }
    }

    if (!fileToUse) {
      console.error("Vui lòng chọn file nghe");
      return;
    }

    const fileType = fileToUse.name.split(".").pop()?.toLowerCase();
    if (!fileType || !allowedFileTypes.includes(fileType)) {
      console.error("File phải có định dạng là: [ mp3, mp4 ]");
      return;
    }

    try {
      // Ví dụ: gọi API tạo transcription
      // const transcriptionResponse = await createTranscription({ file: fileToUse });
      // setQuestion((prev) => ({
      //   ...prev,
      //   transcription: transcriptionResponse as string,
      // }));
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
          {/* Sử dụng input file thay vì Upload của antd */}
          <input
            type="file"
            onChange={handleFileChange}
            accept="audio/*"
          />
          {file && <p>Tệp đã chọn: {file.name}</p>}
        </Form.Item>
        <Form.Item label="Đường dẫn file nghe">
          <Input
            name="filePath"
            value={
              typeof question.filePath === "string"
                ? question.filePath
                : question.filePath
                ? (question.filePath as File).name
                : ""
            }
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
              style={{ width: "95%" }}
            />
            <div className="align-items-center d-flex flex-column justify-content-center">
              <Button
                type="link"
                icon={
                  <img
                    src="/src/Content/img/Google_Translate_Icon.png"
                    height="16px"
                    alt="Translate Icon"
                  />
                }
                onClick={handleSubmit}
                style={{ color: "#FF0000" }}
              />
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
