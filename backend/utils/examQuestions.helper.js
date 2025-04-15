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

const getAnswerCell = (answerText, index) =>
  new TableCell({
    margins: { top: 100, bottom: 100, left: 200, right: 200 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `${["A", "B", "C", "D"][index]}. ${sanitizeAnswerText(
              answerText || ""
            )}`,
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

/**
 * Tạo phần câu hỏi trắc nghiệm với khung màu trắng và khoảng cách hợp lý.
 * @param {Array} questionsMultichoice - Danh sách câu hỏi trắc nghiệm.
 * @returns {Array} - Mảng các Paragraph và Table.
 */
export const formatExamQuestions = (questionsMultichoice) => [
  // 📚 Tiêu Đề Phần Câu Hỏi
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
  }),

  ...questionsMultichoice.flatMap((question, index) => {
    const getAnswerCell = (answerText, index) =>
      new TableCell({
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `${["A", "B", "C", "D"][index]}. ${sanitizeAnswerText(
                  answerText || ""
                )}`,
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

    return [
      // 📝 Hiển thị câu hỏi
      new Paragraph({
        children: [
          // Kiểm tra xem câu hỏi có chứa HTML hay không
          question.content.includes("<")
            ? renderHtmlToTextRun(question.content) // Nếu có HTML, sử dụng renderHtmlToTextRun
            : new TextRun({
                text: `${index + 1}. ${question.content}`,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
        ],
        spacing: { after: 150 },
      }),

      // 📊 Hiển thị đáp án trong bảng 2x2
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
      }),

      // 📏 Khoảng cách giữa các câu
      new Paragraph({
        children: [],
        spacing: { after: 200 },
      }),
    ];
  }),
];
/**
 * Tạo phần câu hỏi điền khuyết đơn giản.
 * @param {Array} questionsFillInBlank - Danh sách câu hỏi điền khuyết.
 * @returns {Array}
 */
export const formatFillInBlankQuestions = (questionsFillInBlank) => [
  // 📚 Tiêu Đề Phần Câu Hỏi
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
  }),

  // 📝 Hiển Thị Từng Câu Hỏi Điền Khuyết
  ...questionsFillInBlank.map((question, index) => 
    new Paragraph({
      children: [
        question.content.includes("<")
          ? renderHtmlToTextRun(question.content)  // Nếu có HTML, render HTML
          : new TextRun({
              text: `${index + 1}. ${question.content}`,
              font: "Times New Roman",
              size: 24,
            }),
      ],
      spacing: { after: 150 },
    })
  ),
];

/**
 * Tạo phần câu hỏi bài nghe (Listening)
 * @param {Array} questionsListening
 * @returns {Array}
 */


export const formatListeningQuestions = (questionsListening) => [
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

  ...questionsListening.flatMap((listening, index) => [
    // Transcript
    new Paragraph({
      children: [
        new TextRun({
          text: `Transcript: ${listening.transcript || '.....................'}`,
          italics: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
      spacing: { after: 100 },
    }),

    // Audio link
    listening.audio
      ? new Paragraph({
          children: [
            new TextRun({
              text: "Audio: ",
              bold: true,
              font: "Times New Roman",
              size: 22,
            }),
            new TextRun({
              text: listening.audio,
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
        }),

    // Questions
    ...listening.questions.flatMap((question, qIndex) => [
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}.${qIndex + 1} ${question.content}`,
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
      }),

      new Paragraph({
        children: [],
        spacing: { after: 200 },
      }),
    ]),
  ]),
];
