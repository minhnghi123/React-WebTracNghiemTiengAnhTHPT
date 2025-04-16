import { Paragraph, TextRun } from "docx";
import * as htmlparser2 from "htmlparser2";

/**
 * Chuyển HTML thành các TextRun trong một Paragraph.
 * @param {string} html - Nội dung HTML cần render.
 * @returns {Paragraph} - Một đoạn văn chứa các TextRun đã chuyển đổi từ HTML.
 */
export const renderHtmlToTextRun = (html) => {
  let paragraphChildren = [];
  let currentStyles = { bold: false, italic: false, underline: false };

  const parser = new htmlparser2.Parser(
    {
      onopentag(name, attribs) {
        if (name === "b") currentStyles.bold = true;
        if (name === "i") currentStyles.italic = true;
        if (name === "u" || attribs.style?.includes("underline")) {
          currentStyles.underline = true;
        }
      },
      ontext(text) {
        paragraphChildren.push(
          new TextRun({
            text,
            ...currentStyles,
            font: "Times New Roman",
            size: 24,
          })
        );
      },
      onclosetag(tagname) {
        if (tagname === "b") currentStyles.bold = false;
        if (tagname === "i") currentStyles.italic = false;
        if (tagname === "u" || tagname === "span")
          currentStyles.underline = false;
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return new Paragraph({ children: paragraphChildren });
};
