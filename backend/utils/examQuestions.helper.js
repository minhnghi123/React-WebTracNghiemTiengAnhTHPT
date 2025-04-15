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
  return text.replace(/^[A-D]\.\s*/, "");
};

/**
 * Tạo một ô đáp án cho bảng, áp dụng HTML nếu có
 * @param {string} answerText - Nội dung đáp án
 * @param {number} index - Vị trí đáp án (A, B, C, D)
 * @returns {TableCell} - Ô đáp án trong bảng
 */


const getAnswerCell = (answerText, index) => {
  const sanitizedAnswer = sanitizeAnswerText(answerText || "");

  return new TableCell({
    margins: { top: 100, bottom: 100, left: 200, right: 200 },
    children: [
      new Paragraph({
        children: [
          sanitizedAnswer.includes("<")
            ? renderHtmlToTextRun(sanitizedAnswer) 
            : new TextRun({
                text: `${["A", "B", "C", "D"][index]}. ${sanitizedAnswer}`,
                font: "Times New Roman",
                size: 22,
              }),
        ],
      }),
    ],
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
  const fullContent = `${index + 1}. ${content}`;
  return content.includes("<")
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
 * Hàm render toàn bộ phần câu hỏi trắc nghiệm
 * @param {Array} questionsMultichoice - Danh sách câu hỏi trắc nghiệm
 * @returns {Array<Paragraph | Table>} - Mảng các phần câu hỏi và bảng đáp án
 */
export const formatExamQuestions = (questionsMultichoice) => {
  const formattedQuestions = [];

  // Tiêu đề phần trắc nghiệm
  formattedQuestions.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CÂU HỎI TRẮC NGHIỆM:",
          bold: true,
          font: "Times New Roman",
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    })
  );

  // Render từng câu hỏi và bảng đáp án
  questionsMultichoice.forEach((question, index) => {
    // ✅ Câu hỏi
    formattedQuestions.push(buildQuestionParagraph(index, question.content));

    // ✅ Bảng đáp án 2x2
    formattedQuestions.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              getAnswerCell(question.answers[0]?.text, 0),
              getAnswerCell(question.answers[1]?.text, 1),
            ],
          }),
          new TableRow({
            children: [
              getAnswerCell(question.answers[2]?.text, 2),
              getAnswerCell(question.answers[3]?.text, 3),
            ],
          }),
        ],
        spacing: { before: 100, after: 200 },
      })
    );

    // ✅ Khoảng cách sau mỗi câu
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
  const fullContent = `${index + 1}. ${content}`;
  return content.includes("<")
    ? renderHtmlToTextRun(fullContent)  // Nếu có HTML, render HTML
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
 * Tạo phần câu hỏi điền khuyết
 * @param {Array} questionsFillInBlank - Danh sách câu hỏi điền khuyết
 * @returns {Array<Paragraph>} - Mảng các câu hỏi điền khuyết dưới dạng Paragraph
 */
export const formatFillInBlankQuestions = (questionsFillInBlank) => {
  const formattedQuestions = [];

  // Tiêu đề phần câu hỏi điền khuyết
  formattedQuestions.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CÂU HỎI ĐIỀN KHUYẾT:",
          bold: true,
          font: "Times New Roman",
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    })
  );

  // Render từng câu hỏi điền khuyết
  questionsFillInBlank.forEach((question, index) => {
    formattedQuestions.push(buildFillInBlankQuestionParagraph(index, question.content));
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
        text: `Transcript: ${transcript || '.....................'}`,
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
  new Paragraph({
    children: [
      question.content.includes("<")
        ? renderHtmlToTextRun(`${qIndex + 1} ${question.content}`)  // Render HTML nếu có trong câu hỏi
        : new TextRun({
            text: `${qIndex + 1} ${question.content}`,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
    ],
    spacing: { after: 100 },
  }),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          question.answers[0]?.text.includes("<") 
            ? renderHtmlToTextRun(question.answers[0]?.text) 
            : new TextRun({
                text: question.answers[0]?.text || "",
                font: "Times New Roman",
                size: 22,
              }),
          question.answers[1]?.text.includes("<") 
            ? renderHtmlToTextRun(question.answers[1]?.text) 
            : new TextRun({
                text: question.answers[1]?.text || "",
                font: "Times New Roman",
                size: 22,
              }),
        ],
      }),
      new TableRow({
        children: [
          question.answers[2]?.text.includes("<") 
            ? renderHtmlToTextRun(question.answers[2]?.text) 
            : new TextRun({
                text: question.answers[2]?.text || "",
                font: "Times New Roman",
                size: 22,
              }),
          question.answers[3]?.text.includes("<") 
            ? renderHtmlToTextRun(question.answers[3]?.text) 
            : new TextRun({
                text: question.answers[3]?.text || "",
                font: "Times New Roman",
                size: 22,
              }),
        ],
      }),
    ],
    spacing: { before: 100, after: 200 },
  }),

  new Paragraph({
    children: [],
    spacing: { after: 200 },
  }),
];


/**
 * Tạo phần câu hỏi bài nghe
 * @param {Array} questionsListening - Danh sách câu hỏi bài nghe
 * @returns {Array}
 */
export const formatListeningQuestions = (questionsListening) => [
  // 📚 Tiêu Đề Phần Câu Hỏi Bài Nghe
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

  // 📝 Hiển Thị Các Câu Hỏi Bài Nghe
  ...questionsListening.flatMap((listening, index) => [
    // Hiển thị Transcript
    buildTranscriptParagraph(listening.transcript),

    // Hiển thị Audio link
    buildAudioLinkParagraph(listening.audio),

    // Hiển thị các câu hỏi bài nghe
    ...listening.questions.flatMap((question, qIndex) =>
      buildListeningQuestion(question, qIndex)
    ),
  ]),
];

