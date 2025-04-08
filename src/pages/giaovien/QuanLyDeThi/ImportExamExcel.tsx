import { useState } from "react";
import { Upload, Button, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ExamAPI } from "@/services/teacher/Teacher";
import axios from "axios";

const ImportExamExcel = () => {
  const [examFile, setExamFile] = useState<File | null>(null);
  const [passageFile, setPassageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!examFile || !passageFile) {
      return message.error("Vui lòng chọn đầy đủ cả 2 file!");
    }

    const formData = new FormData();
    formData.append("examFile", examFile);
    formData.append("passageFile", passageFile);

    try {
      setLoading(true);
      const res = await ExamAPI.ImportExamExcel(formData);
      console.log(res);
      if (res.success) {
        message.success("Import đề thi thành công!");
      } else {
        message.error("Import thất bại!");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi khi gửi yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Nhập đề thi từ Excel" className="max-w-2xl mx-auto mt-8">
      <div className="space-y-4">
        <div>
          <p className="font-medium mb-1">Chọn file bài đọc (passage):</p>
          <Upload
            beforeUpload={(file) => {
              setPassageFile(file);
              return false; // prevent auto upload
            }}
            maxCount={1}
            accept=".xlsx, .xls"
          >
            <Button icon={<UploadOutlined />}>Chọn file bài đọc</Button>
          </Upload>
        </div>

        <div>
          <p className="font-medium mb-1">Chọn file đề thi (exam):</p>
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
        </div>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={loading}
          className="mt-4"
        >
          Nhập đề thi
        </Button>
      </div>
    </Card>
  );
};

export default ImportExamExcel;
