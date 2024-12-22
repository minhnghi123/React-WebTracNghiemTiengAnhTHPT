import { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';

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

  // 📚 Xử Lý Danh Sách Câu Hỏi
  ...questionsMultichoice.map((question, index) => {
    const MAX_ANSWER_LENGTH = 30; // Độ dài tối đa của 1 đáp án để quyết định kiểu hiển thị

    // Kiểm tra xem tất cả đáp án có ngắn không
    const isShortAnswers = question.answers.every(
      (answer) => answer.text.length <= MAX_ANSWER_LENGTH
    );

    return [
      // 📝 Hiển Thị Câu Hỏi
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${question.content}`,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: 150 }, // Khoảng cách giữa câu hỏi và đáp án
      }),

      // 🅰️ Hiển Thị Đáp Án
      isShortAnswers
        ? // 📊 Hiển Thị 2 Đáp Án Trên 1 Hàng (Dạng Bảng Với Khung Màu Trắng)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 200, right: 200 }, // Padding bên trong ô
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `A. ${question.answers[0]?.text || ''}`,
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
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `B. ${question.answers[1]?.text || ''}`,
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
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `C. ${question.answers[2]?.text || ''}`,
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
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `D. ${question.answers[3]?.text || ''}`,
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
                  }),
                ],
              }),
            ],
            spacing: { before: 100, after: 200 }, // Khoảng cách giữa bảng và câu hỏi tiếp theo
          })
        : // 📊 Hiển Thị Mỗi Đáp Án Trên 1 Hàng
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: question.answers.map((answer, i) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${['A', 'B', 'C', 'D'][i]}. ${answer.text}`,
                          font: "Times New Roman",
                          size: 22,
                        }),
                      ],
                      spacing: { after: 50 }, // Khoảng cách giữa các đáp án
                    }),
                  ],
                  margins: { top: 100, bottom: 100, left: 200, right: 200 }, // Padding bên trong ô
                  borders: {
                    top: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                    bottom: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                    left: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                    right: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                  },
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ],
            })
          ),
          spacing: { before: 50, after: 100 }, // Khoảng cách giữa bảng và câu hỏi tiếp theo
        }),
    

      // 📝 Thêm Khoảng Cách Giữa Các Câu Hỏi
      new Paragraph({
        children: [],
        spacing: { after: 200 }, // Khoảng cách giữa câu hỏi này và câu hỏi tiếp theo
      }),
    ];
  }).flat(),
];


/**
 * Tạo phần câu hỏi điền khuyết đơn giản.
 * @param {Array} questionsFillInBlank - Danh sách câu hỏi điền khuyết.
 * @returns {Array} - Mảng các Paragraph.
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
        new TextRun({
          text: `${index + 1}. ${question.content}`,
          font: "Times New Roman",
          size: 24,
        }),
      ],
      spacing: { after: 150 }, // Khoảng cách giữa các câu hỏi
    })
  )
];


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

  // 🎧 Xử Lý Từng Bài Nghe
  ...questionsListening.flatMap((listening, index) => [
    // 📝 Hiển Thị Transcript
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

    // 🎼 Hiển Thị Link Audio (nếu có)
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
      : new Paragraph({ children: [] }),

    // 📚 Hiển Thị Danh Sách Câu Hỏi Kèm Đáp Án
    ...listening.questions.flatMap((question, qIndex) => [
      // 📝 Câu Hỏi
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

      // 🅰️ Đáp Án
      ...question.answers.map((answer, i) => 
        new Paragraph({
          children: [
            new TextRun({
              text: `${['A', 'B', 'C', 'D'][i]}. ${answer.text}`,
              font: "Times New Roman",
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      ),

      // 📏 Khoảng Cách Giữa Các Câu Hỏi
      new Paragraph({
        children: [],
        spacing: { after: 150 },
      }),
    ]),

    // 📏 Khoảng Cách Giữa Các Phần Bài Nghe
    new Paragraph({
      children: [],
      spacing: { after: 200 },
    }),
  ]),
];