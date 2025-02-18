import { QuestionAPI, Question } from "@/services/teacher/Teacher";
import { cleanString } from "@/utils/cn";
import { Divider, Flex, Modal, Tag } from "antd";
import clsx from "clsx";
import "./cauhoi.css";
import { useState } from "react";
import UpdateQuestionModal from "./CreateQuestion/UpdateQuestion";
import UpdateBlankQuestionModal from "./CreateQuestion/UpdateQuestionBlank";
import { UpdateAudioModal } from "../QuanLyFileAudio/FileAudio/UpdateDangCauHoiModal";
type QuestionComponentProps = {
  question: Question;
  onUpdateSuccess: () => void;
  questionType: string;
  editable?: boolean;
  deletetalbe?: boolean;
};

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  onUpdateSuccess,
  question,
  questionType,
  editable = true,
  deletetalbe = true,
}) => {
  const [open, setOpen] = useState(false);
  const [openAudioUpdate, setOpenAudioUpdate] = useState(false);
  const handleOk = () => {
    handleDeleteQuestion(question._id || "");

    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };
  const handleDeleteQuestion = async (id: string) => {
    try {
      const rq = await QuestionAPI.deleteQuestion(id);
      if (rq?.code === 200) {
        alert("Xóa câu hỏi thành công");
        onUpdateSuccess();
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const handleAudioUpdateSuccess = () => {
    setOpenAudioUpdate(false);
    window.location.reload();
  };
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        <span
          dangerouslySetInnerHTML={{ __html: cleanString(question.content) }}
        />
      </h3>{" "}
      <div className="mt-1">
        {question.answers.map((answer) => (
          <div>
            {questionType === "6742fb1cd56a2e75dbd817ea" ? (
              <div
                key={answer._id}
                className={`ml-2 rounded mb-2 ${
                  answer.isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {cleanString(answer.text || "")}
              </div>
            ) : (
              <div
                key={answer._id}
                className="ml-2 rounded mb-2 bg-green-100"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {cleanString(answer.correctAnswerForBlank || "")}
              </div>
            )}
          </div>
        ))}
      </div>
      <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
        Loại câu hỏi
      </Divider>
      <Flex gap="10px 0" wrap>
        <Tag
          color={clsx(
            question.level === "easy" && "green",
            question.level === "medium" && "yellow",
            question.level === "hard" && "red"
          )}
          className="type-question"
        >
          {question.level}
        </Tag>
        <Tag color="blue">{question.subject}</Tag>
        <Tag color="cyan">{question.knowledge}</Tag>
      </Flex>
      <hr />
      <p
        className="text-sm text-gray-600 mb-2"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <span style={{ fontWeight: "bold" }}>Giải thích: </span>
        <span
          dangerouslySetInnerHTML={{ __html: cleanString(question.explanation) }}
        />
        
      </p>
      <p
        className="text-sm text-gray-600 mb-2"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <span style={{ fontWeight: "bold" }}>Dịch: </span>
        {cleanString(question.translation)}
      </p>
      {question.audioInfo && (
        <div>
          <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
            Phần nghe
          </Divider>
          <audio controls>
            <source src={typeof question.audioInfo.filePath === 'string' ? question.audioInfo.filePath : ''} type="audio/mpeg" />
          </audio>

          <p
            className="text-sm text-gray-600 mb-2"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span style={{ fontWeight: "bold" }}>Giải thích: </span>
            {cleanString(question.audioInfo.description)}
          </p>
          <p
            className="text-sm text-gray-600 mb-2"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span style={{ fontWeight: "bold" }}>Dịch: </span>
            {cleanString(question.audioInfo.transcription)}
          </p>
        </div>
      )}
      {
        editable && (
          <>
            <hr />
      <button className="btn btn-primary" onClick={() => setOpenModal(true)}>
        Sửa câu hỏi
      </button>
      {
        deletetalbe && (
          <button className="btn btn-danger" onClick={() => setOpen(true)}>
            Xóa câu hỏi
          </button>
        )
      }
    
      {question.audioInfo && <button className=" btn-w   my-3 mx-3" onClick={() => setOpenAudioUpdate(true)}>
        Sửa file nghe
      </button> } 
      {questionType === "6742fb1cd56a2e75dbd817ea" ? (
        <UpdateQuestionModal
          visible={openModal}
          onUpdateSuccess={() => onUpdateSuccess()}
          handleClose={() => {
            setOpenModal(false);
          }}
          question2={question}
        />
      ) : (
        <UpdateBlankQuestionModal
          visible={openModal}
          handleClose={() => {
            setOpenModal(false), onUpdateSuccess();
          }}
          question2={question}
        />
      )}
      <Modal
        open={open}
        title="Xóa câu hỏi"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <p>Bạn có chắc chắn muốn xóa câu hỏi này</p>
      </Modal>
          </>
        )
      }
      {question.audioInfo && (
        <UpdateAudioModal
          audioData={question.audioInfo}
          visible={openAudioUpdate}
          handleClose={handleAudioUpdateSuccess}

        />
      )}
    </div>
  );
};

export default QuestionComponent;
