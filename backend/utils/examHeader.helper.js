import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
} from "docx";

/**
 * Tạo phần header cho tài liệu Word.
 * @param {Object} data - Dữ liệu cho header.
 * @returns {Array} - Mảng các thành phần header.
 */
export const formatExamHeader = (data, variantCode) => {
  const {
    title,
    description,
    school,
    department,
    subject,
    teacher,
    duration,
    comments,
  } = data;

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              margins: { top: 100, bottom: 100, left: 200, right: 200 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: department,
                      bold: true,
                      font: "Times New Roman",
                      size: 24,
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: school,
                      bold: true,
                      italics: true,
                      font: "Times New Roman",
                      size: 26,
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                bottom: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                left: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                right: { style: BorderStyle.SINGLE, color: "FFFFFF" },
              },
            }),
            new TableCell({
              margins: { top: 100, bottom: 100, left: 200, right: 200 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: title,
                      bold: true,
                      font: "Times New Roman",
                      size: 28,
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `NĂM HỌC: ${description}`,
                      bold: true,
                      font: "Times New Roman",
                      size: 24,
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `MÔN: ${subject}`,
                      bold: true,
                      font: "Times New Roman",
                      size: 24,
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Thời gian làm bài: ${duration} phút`,
                      italics: true,
                      font: "Times New Roman",
                      size: 22,
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                bottom: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                left: { style: BorderStyle.SINGLE, color: "FFFFFF" },
                right: { style: BorderStyle.SINGLE, color: "FFFFFF" },
              },
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Mã đề thi: ${variantCode}`,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 300, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: "Họ, tên thí sinh: .....................................................................................",
          font: "Times New Roman",
          size: 24,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Số báo danh: .....................................................................................",
          font: "Times New Roman",
          size: 24,
        }),
      ],
      spacing: { after: 200 },
    }),
  ];
};
