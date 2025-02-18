import { ExamAPIStudent } from "@/services/student";
import { Exam } from "@/services/teacher/Teacher";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "antd";
import { KetQua } from "../KetQua";
import "./Detail.css";
export const DetailExam = () => {
  const { _id } = useParams<{ _id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);

  const fetchExam = async () => {
    const response = await ExamAPIStudent.getDetailExam(_id ?? "");
    console.log(response);
    if (response.code === 200) {
      setExam(response.exam);

      setQuestionCount(response.exam.questions.length);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [_id]);
  const navigator = useNavigate();
  const handleJoinExam = (id: string) => {
    navigator(`/KyThi/BaiLam/${id}`);
  };
  return (
    <div className="container mt-4">
      {exam ? (
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">{exam.title}</h1>
          </div>
          <div className="card-body">
            <p className="card-text">
              <strong>Giới thiệu:</strong> {exam.description}
            </p>
            <p className="card-text">
              <strong>Số lượng câu hỏi:</strong> {questionCount}
            </p>
            <p className="card-text">
              <strong>Thời gian:</strong> {exam.duration} minutes
            </p>

            <p className="card-text">
              <strong>Thời gian bắt đầu:</strong>{" "}
              {new Date(exam.startTime).toLocaleString()}
            </p>
            <p className="card-text">
              <strong>Thời gian kết thúc:</strong>{" "}
              {exam.endTime
                ? new Date(exam.endTime).toLocaleString()
                : "Không giới hạn thời gian"}
            </p>
            <center>
              <Button
                onClick={() => {
                  handleJoinExam(exam._id ?? "");
                }}
              >
                Làm bài
              </Button>
            </center>
          </div>

          <KetQua DeThi={exam._id} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DetailExam;
