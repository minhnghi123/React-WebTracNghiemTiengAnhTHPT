import { useState } from "react";
import {
  Upload,
  Button,
  message,
  Card,
  Radio,
  Divider,
  Space,
  Typography,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  ReadOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { ExamAPI } from "@/services/teacher/Teacher";

const { Title, Text, Paragraph } = Typography;

const ImportExamExcel = () => {
  const [examType, setExamType] = useState<"simple" | "reading" | "listening">(
    "simple"
  );
  const [examFile, setExamFile] = useState<File | null>(null);
  const [passageFile, setPassageFile] = useState<File | null>(null);
  const [listeningFile, setListeningFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!examFile) return message.error("Vui lòng chọn file đề thi!");
    if (examType === "reading" && !passageFile)
      return message.error("Vui lòng chọn file bài đọc!");
    if (examType === "listening" && !listeningFile)
      return message.error("Vui lòng chọn file bài nghe!");

    const formData = new FormData();
    formData.append("examFile", examFile);
    formData.append("examType", examType);
    if (examType === "reading") formData.append("passageFile", passageFile!);
    if (examType === "listening") formData.append("audioFile", listeningFile!);

    try {
      setLoading(true);
      const res =
        examType === "reading"
          ? await ExamAPI.ImportExamExcel(formData)
          : examType === "listening"
          ? await ExamAPI.ImportExamExcelListening(formData)
          : await ExamAPI.ImportExamExcelSimple(formData);

      if (res.success) {
        message.success("Nhập đề thi thành công!");
      } else {
        message.error("Nhập đề thi thất bại!");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        message.error(err.message || "Lỗi khi gửi yêu cầu!");
      } else {
        message.error("Đã xảy ra lỗi không xác định!");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderGuide = () => {
    switch (examType) {
      case "simple":
        return (
          <Paragraph type="secondary" className="text-sm">
            📘 <strong>Hướng dẫn:</strong> File Excel đề thi phải có các cột
            sau:
            <br />
            <code>
              Content, QuestionType, Level, AnswerA, AnswerB, AnswerC, AnswerD,
              CorrectAnswers, Knowledge, Translation, Explanation
            </code>
          </Paragraph>
        );
      case "reading":
        return (
          <>
            <Paragraph type="secondary" className="text-sm">
              📘 <strong>Hướng dẫn file đề thi:</strong> Bao gồm:
              <br />
              <code>
                PassageId, Content, QuestionType, Level, AnswerA, AnswerB,
                AnswerC, AnswerD, CorrectAnswers, Knowledge, Translation,
                Explanation
              </code>
            </Paragraph>
            <Paragraph type="secondary" className="text-sm">
              📘 <strong>Hướng dẫn file bài đọc:</strong> Bao gồm:
              <br />
              <code>STT, PassageId, Title, Content</code>
            </Paragraph>
          </>
        );
      case "listening":
        return (
          <Paragraph type="secondary" className="text-sm">
            📘 <strong>Hướng dẫn:</strong> File Excel đề thi phải có các cột
            như:
            <br />
            <code>
              Content, QuestionType, Level, AnswerA, AnswerB, AnswerC, AnswerD,
              CorrectAnswers
            </code>
          </Paragraph>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      title={<Title level={4}>Nhập đề thi từ Excel</Title>}
      className="max-w-3xl mx-auto mt-8 shadow-md rounded-xl"
    >
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Text strong>1. Chọn loại đề thi: </Text>
          <Radio.Group
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="ml-4"
          >
            <Radio value="simple">
              <FileTextOutlined className="mr-1" />
              Trắc nghiệm đơn lẻ
            </Radio>
            <Radio value="reading">
              <ReadOutlined className="mr-1" />
              Kết hợp bài đọc
            </Radio>
            <Radio value="listening">
              <SoundOutlined className="mr-1" />
              Đề thi Listening
            </Radio>
          </Radio.Group>
        </div>

        <Divider className="m-0" />

        <div>
          <Text strong>2. Tải lên file đề thi: </Text>
          <Upload
            beforeUpload={(file) => {
              setExamFile(file);
              return false;
            }}
            maxCount={1}
            accept=".xlsx, .xls"
          >
            <Button icon={<UploadOutlined />}>Chọn file đề thi</Button>
          </Upload>
          {examFile && <Text type="secondary">📎 {examFile.name}</Text>}
        </div>

        {examType === "reading" && (
          <div>
            <Text strong>3. Tải lên file bài đọc: </Text>
            <Upload
              beforeUpload={(file) => {
                setPassageFile(file);
                return false;
              }}
              maxCount={1}
              accept=".xlsx, .xls"
            >
              <Button icon={<UploadOutlined />}>Chọn file bài đọc</Button>
            </Upload>
            {passageFile && <Text type="secondary">📎 {passageFile.name}</Text>}
          </div>
        )}

        {examType === "listening" && (
          <div>
            <Text strong>3. Tải lên file nghe:</Text>
            <Upload
              beforeUpload={(file) => {
                setListeningFile(file);
                return false;
              }}
              maxCount={1}
              accept="audio/*"
            >
              <Button icon={<UploadOutlined />}>Chọn file bài nghe</Button>
            </Upload>
            {listeningFile && (
              <Text type="secondary">📎 {listeningFile.name}</Text>
            )}
          </div>
        )}

        {renderGuide()}

        <Divider className="m-0" />

        <Button
          type="primary"
          onClick={handleUpload}
          loading={loading}
          className="w-full"
        >
          Nhập đề thi
        </Button>
      </Space>
    </Card>
  );
};

export default ImportExamExcel;
