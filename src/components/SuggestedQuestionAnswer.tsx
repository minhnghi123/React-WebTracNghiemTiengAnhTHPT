import React from "react";
import { Question } from "@/types/interface";
import { Typography, Radio, Input, Tag } from "antd";
import { cleanString } from "@/utils/cn";

const { Title, Paragraph } = Typography;

type SuggestedQuestionAnswerProps = {
  question: Question;
};

const SuggestedQuestionAnswer: React.FC<SuggestedQuestionAnswerProps> = ({
  question,
}) => {
  const renderFillInTheBlanks = () => {
    const placeholderRegex = /_+/g;
    const parts = question.content.split(placeholderRegex);
    const correctAnswers = question.answers?.map((a) => a.correctAnswerForBlank) || [];

    return (
      <Paragraph>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < correctAnswers.length && (
              <Input
                style={{ width: "150px", margin: "0 4px" }}
                value={correctAnswers[index]}
                disabled
              />
            )}
          </React.Fragment>
        ))}
      </Paragraph>
    );
  };

  const renderMultipleChoices = () => {
    return (
      <Radio.Group value={question.answers?.find((a) => a.isCorrect)?._id} disabled>
        {question.answers?.map((answer) => (
          <Radio key={answer._id} value={answer._id}>
            <span
              dangerouslySetInnerHTML={{
                __html: cleanString(answer.text || ""),
              }}
            />
            {answer.isCorrect && (
              <Tag color="green" style={{ marginLeft: "8px" }}>
                Đúng
              </Tag>
            )}
          </Radio>
        ))}
      </Radio.Group>
    );
  };

  const renderTrueFalseNotGiven = () => {
    const correctAnswer = question.correctAnswerForTrueFalseNGV;
    return (
      <Radio.Group value={correctAnswer} disabled>
        <Radio value="true">True</Radio>
        <Radio value="false">False</Radio>
        <Radio value="notgiven">Not Given</Radio>
      </Radio.Group>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <Title level={5} style={{ whiteSpace: "pre-wrap" }}>
        {question.content}
      </Title>
      <div className="mt-2">
        {question.questionType === "6742fb3bd56a2e75dbd817ec" && renderFillInTheBlanks()}
        {question.questionType === "6742fb1cd56a2e75dbd817ea" && renderMultipleChoices()}
        {question.questionType === "6742fb5dd56a2e75dbd817ee" && renderTrueFalseNotGiven()}
      </div>
    </div>
  );
};

export default SuggestedQuestionAnswer;
