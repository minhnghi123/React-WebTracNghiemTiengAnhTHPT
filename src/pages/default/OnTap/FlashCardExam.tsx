import React, { useEffect, useState } from "react";
import { Spin, Button, message } from "antd";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import { FlashCardExamTrueFalse } from "./ExamFlashCard/TrueFalse";
import { FlashCardExamMultipleChoice } from "./ExamFlashCard/FlashCardExamMultipleChoice";
import { FlashCardExamWritten } from "./ExamFlashCard/FlashCardExamWritten";
import { FlashCardMatch } from "./ExamFlashCard/FlashCardMatch";

export const FlashCardExam: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy id của flashcard set
  const location = useLocation();
  const navigate = useNavigate();
  const [flashCardSet, setFlashCardSet] = useState<FlashCardSet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const query = new URLSearchParams(location.search);
  let examType = query.get("examType") || "true false";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await FlashCardAPI.getFlashCardSetDetail(id!);
        setFlashCardSet(res.flashCardSet);
      } catch (error) {
        console.error("Error loading flashcard set:", error);
        message.error("Error loading flashcard set");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!flashCardSet) {
    return <div>Flashcard set not found</div>;
  }

  // Hàm render giao diện dựa vào examType
  const renderExam = () => {
    examType=examType.toLocaleLowerCase();
    console.log(examType);
    switch (examType) {
      case "true false":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Exam: True / False</h2>
            <FlashCardExamTrueFalse flashCardSet={flashCardSet}/>
          </div>
        );
      case "multiple choices":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Exam: Multiple Choices</h2>
            <FlashCardExamMultipleChoice flashCardSet={flashCardSet}/>
          </div>
        );
      case "written":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Exam: Written</h2>
            <FlashCardExamWritten flashCardSet={flashCardSet} />
          </div>
        );
      case "match":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Exam: Match</h2>
            <FlashCardMatch flashCardSet={flashCardSet}/>
          </div>
        );
      default:
        return <div>Exam type không hợp lệ</div>;
    }
  };

  return (
    <div className="container">
     
      {renderExam()}
      <div className="mt-6 text-center">
        <Button type="primary" onClick={() => navigate(`/flashcard/${flashCardSet._id}`)}>
          Quay lại chi tiết flashcard
        </Button>
      </div>
    </div>
  );
};
