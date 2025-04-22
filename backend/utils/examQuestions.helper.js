import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { renderHtmlToTextRun } from "./renderHtmlToTextRun.js";

/**
 * Xóa tiền tố "A. ", "B. ", ... nếu có trong text.
 * @param {string} text - Nội dung đáp án gốc.
 * @returns {string} - Nội dung đã làm sạch.
 */
const sanitizeAnswerText = (text) => {
  return (text || "").replace(/^[A-D]\.\s*/, "");
};

/**
 * Tạo một ô đáp án cho bảng, áp dụng HTML nếu có
 * @param {string} answerText - Nội dung đáp án
 * @param {number} index - Vị trí đáp án (A, B, C, D)
 * @returns {TableCell} - Ô đáp án trong bảng
 */
const getAnswerCell = (answerText, index) => {
  const sanitizedAnswer = sanitizeAnswerText(answerText || "");
  const isHtml = sanitizedAnswer.includes("<");
  const label = `${["A", "B", "C", "D"][index]}. `;

  const cellChildren = [];

  // Đoạn đầu là nhãn A., B., ...
  cellChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: label,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  // Phần nội dung của đáp án
  if (isHtml) {
    cellChildren.push(renderHtmlToTextRun(sanitizedAnswer));
  } else {
    cellChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizedAnswer,
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
  }

  return new TableCell({
    margins: { top: 100, bottom: 100, left: 200, right: 200 },
    children: cellChildren,
    borders: {
      top: { style: BorderStyle.SINGLE, color: "FFFFFF" },
      bottom: { style: BorderStyle.SINGLE, color: "FFFFFF" },
      left: { style: BorderStyle.SINGLE, color: "FFFFFF" },
      right: { style: BorderStyle.SINGLE, color: "FFFFFF" },
    },
    width: { size: 50, type: WidthType.PERCENTAGE },
  });
};

/**
 * Hàm tạo đoạn câu hỏi, hỗ trợ HTML
 * @param {number} index - Số thứ tự của câu hỏi
 * @param {string} content - Nội dung câu hỏi
 * @returns {Paragraph} - Đoạn văn câu hỏi
 */
const buildQuestionParagraph = (index, content) => {
  const fullContent = `${index}. ${content || ""}`;
  return (content || "").includes("<")
    ? renderHtmlToTextRun(fullContent)
    : new Paragraph({
        children: [
          new TextRun({
            text: fullContent,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: 150 },
      });
};

/**
 * Render all multiple-choice questions without a title and with sequential numbering.
 * @param {Array} questionsMultichoice - List of multiple-choice questions.
 * @param {number} startIndex - Starting index for numbering.
 * @returns {Array<Paragraph | Table>} - Array of formatted questions and answer tables.
 */
export const formatExamQuestions = (questionsMultichoice, startIndex = 1) => {
  const formattedQuestions = [];

  questionsMultichoice.forEach((question, index) => {
    const questionNumber = startIndex + index;

    // ✅ Question
    formattedQuestions.push(buildQuestionParagraph(questionNumber, question.content));

    // Check if all answers are empty or contain only whitespace
    const allAnswersEmptyOrWhitespace = (question.answers || []).every(
      (answer) => !answer?.text?.trim()
    );

    if (!allAnswersEmptyOrWhitespace) {
      // ✅ Answer table (2x2)
      formattedQuestions.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                getAnswerCell(question.answers?.[0]?.text, 0),
                getAnswerCell(question.answers?.[1]?.text, 1),
              ],
            }),
            new TableRow({
              children: [
                getAnswerCell(question.answers?.[2]?.text, 2),
                getAnswerCell(question.answers?.[3]?.text, 3),
              ],
            }),
          ],
          spacing: { before: 100, after: 200 },
        })
      );
    }

    // ✅ Spacing after each question
    formattedQuestions.push(
      new Paragraph({
        children: [],
        spacing: { after: 200 },
      })
    );
  });

  return formattedQuestions;
};

/**
 * Hàm tạo đoạn câu hỏi điền khuyết, hỗ trợ HTML
 * @param {number} index - Số thứ tự của câu hỏi
 * @param {string} content - Nội dung câu hỏi
 * @returns {Paragraph} - Đoạn văn câu hỏi điền khuyết
 */
const buildFillInBlankQuestionParagraph = (index, content) => {
  const fullContent = `${index}. ${content || ""}`;
  return (content || "").includes("<")
    ? renderHtmlToTextRun(fullContent) // Nếu có HTML, render HTML
    : new Paragraph({
        children: [
          new TextRun({
            text: fullContent,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: 150 },
      });
};

/**
 * Render all fill-in-the-blank questions without a title and with sequential numbering.
 * @param {Array} questionsFillInBlank - List of fill-in-the-blank questions.
 * @param {number} startIndex - Starting index for numbering.
 * @returns {Array<Paragraph>} - Array of formatted fill-in-the-blank questions.
 */
export const formatFillInBlankQuestions = (questionsFillInBlank, startIndex = 1) => {
  const formattedQuestions = [];

  questionsFillInBlank.forEach((question, index) => {
    const questionNumber = startIndex + index;
    formattedQuestions.push(buildFillInBlankQuestionParagraph(questionNumber, question.content));
  });

  return formattedQuestions;
};

/**
 * Tạo hàm hiển thị Transcript
 * @param {string} transcript - Nội dung Transcript
 * @returns {Paragraph}
 */
const buildTranscriptParagraph = (transcript) =>
  new Paragraph({
    children: [
      new TextRun({
        text: `Transcript: ${transcript || "....................."}`,
        italics: true,
        font: "Times New Roman",
        size: 22,
      }),
    ],
    spacing: { after: 100 },
  });

/**
 * Tạo hàm hiển thị Audio link
 * @param {string} audio - Đường dẫn đến file audio
 * @returns {Paragraph}
 */
const buildAudioLinkParagraph = (audio) =>
  audio
    ? new Paragraph({
        children: [
          new TextRun({
            text: "Audio: ",
            bold: true,
            font: "Times New Roman",
            size: 22,
          }),
          new TextRun({
            text: audio,
            style: "Hyperlink",
            color: "0563C1",
            underline: true,
          }),
        ],
        spacing: { after: 150 },
      })
    : new Paragraph({
        children: [new TextRun({ text: "", size: 1 })],
        spacing: { after: 100 },
      });

/**
 * Tạo hàm hiển thị câu hỏi và đáp án, hỗ trợ HTML trong đáp án
 * @param {Object} question - Câu hỏi
 * @param {number} qIndex - Số thứ tự câu hỏi
 * @returns {Array<Paragraph | Table>}
 */
const buildListeningQuestion = (question, qIndex) => [
  // 📌 Hiển thị câu hỏi
  new Paragraph({
    children: [
      new TextRun({
        text: `${qIndex}. `,
        bold: true,
        font: "Times New Roman",
        size: 24,
      }),
    ],
  }),
  ...((question.content || "").includes("<")
    ? [renderHtmlToTextRun(question.content || "")]
    : [
        new Paragraph({
          children: [
            new TextRun({
              text: question.content || "",
              bold: true,
              font: "Times New Roman",
              size: 24,
            }),
          ],
        }),
      ]),

  // 📌 Hiển thị bảng đáp án
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              (question.answers?.[0]?.text || "").includes("<")
                ? renderHtmlToTextRun(question.answers?.[0]?.text || "")
                : new Paragraph({
                    children: [
                      new TextRun({
                        text: question.answers?.[0]?.text || "",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                  }),
            ],
          }),
          new TableCell({
            children: [
              (question.answers?.[1]?.text || "").includes("<")
                ? renderHtmlToTextRun(question.answers?.[1]?.text || "")
                : new Paragraph({
                    children: [
                      new TextRun({
                        text: question.answers?.[1]?.text || "",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                  }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              (question.answers?.[2]?.text || "").includes("<")
                ? renderHtmlToTextRun(question.answers?.[2]?.text || "")
                : new Paragraph({
                    children: [
                      new TextRun({
                        text: question.answers?.[2]?.text || "",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                  }),
            ],
          }),
          new TableCell({
            children: [
              (question.answers?.[3]?.text || "").includes("<")
                ? renderHtmlToTextRun(question.answers?.[3]?.text || "")
                : new Paragraph({
                    children: [
                      new TextRun({
                        text: question.answers?.[3]?.text || "",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                  }),
            ],
          }),
        ],
      }),
    ],
    spacing: { before: 100, after: 200 },
  }),

  new Paragraph({ children: [], spacing: { after: 200 } }),
];

/**
 * Render all listening questions with the title retained and sequential numbering.
 * @param {Array} questionsListening - List of listening questions.
 * @param {number} startIndex - Starting index for numbering.
 * @returns {Array} - Array of formatted listening questions.
 */
export const formatListeningQuestions = (questionsListening, startIndex = 1) => {
  const formattedListening = [
    // 📚 Title for the listening section
    new Paragraph({
      children: [
        new TextRun({
          text: "CÂU HỎI BÀI NGHE:",
          bold: true,
          font: "Times New Roman",
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    }),
  ];

  // 📝 Render each listening exam
  questionsListening.forEach((listening, index) => {
    // Add title for each listening exam
    formattedListening.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Phần nghe số ${index + 1}:`,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: 150 },
      })
    );

    // Display transcript
    formattedListening.push(buildTranscriptParagraph(listening.transcript));

    // Display audio link
    formattedListening.push(buildAudioLinkParagraph(listening.audio));

    // Display questions
    formattedListening.push(
      ...listening.questions.flatMap((question, qIndex) =>
        buildListeningQuestion(question, startIndex + qIndex)
      )
    );
  });

  // Add title for the reading section after all listening questions
  formattedListening.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CÂU HỎI PHẦN ĐỌC:",
          bold: true,
          font: "Times New Roman",
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    })
  );

  return formattedListening;
};

/**
 * Render all reading questions grouped by passage with sequential numbering.
 * @param {Array} questionsReading - List of reading questions grouped by passage.
 * @param {number} startIndex - Starting index for numbering.
 * @returns {Array<Paragraph | Table>} - Array of formatted reading questions.
 */
export const formatReadingQuestions = (questionsReading, startIndex = 1) => {
  const formattedReading = [];
  let questionCounter = startIndex;

  questionsReading.forEach((readingItem, readingIndex) => {
    // Display passage
    formattedReading.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Đoạn ${readingIndex + 1}:`,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: 100 },
      }),
      renderHtmlToTextRun(readingItem.passage || "")
    );

    // Display questions related to the passage
    readingItem.questions.forEach((question) => {
      formattedReading.push(buildQuestionParagraph(questionCounter, question.content));

      // Answer table
      formattedReading.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                getAnswerCell(question.answers?.[0]?.text, 0),
                getAnswerCell(question.answers?.[1]?.text, 1),
              ],
            }),
            new TableRow({
              children: [
                getAnswerCell(question.answers?.[2]?.text, 2),
                getAnswerCell(question.answers?.[3]?.text, 3),
              ],
            }),
          ],
          spacing: { before: 100, after: 200 },
        })
      );

      // Spacing between questions
      formattedReading.push(
        new Paragraph({
          children: [],
          spacing: { after: 200 },
        })
      );

      questionCounter++;
    });
  });

  return formattedReading;
};