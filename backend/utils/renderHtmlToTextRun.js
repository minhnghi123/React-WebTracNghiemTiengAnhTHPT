import {  Paragraph, TextRun } from "docx";
import * as htmlparser2 from "htmlparser2";


export const renderHtmlToTextRun = (html) => {
  let paragraphChildren = []; // Chứa tất cả TextRun trong 1 đoạn Paragraph
  const parser = new htmlparser2.Parser(
    {
      onopentag(name, attribs) {
        // Xử lý các thẻ HTML
        if (name === "b") {
          this.bold = true;
        }
        if (name === "i") {
          this.italic = true;
        }
        if (name === "u") {
          this.underline = true;
        }
        if (name === "span" && attribs.style && attribs.style.includes("text-decoration: underline")) {
          this.underline = true;
        }
      },
      ontext(text) {
        const options = {};
        if (this.bold) options.bold = true;
        if (this.italic) options.italic = true;
        if (this.underline) options.underline = true;

        // Tạo TextRun với các style đã xác định
        paragraphChildren.push(new TextRun({ text, ...options }));

        // Reset các thuộc tính sau khi đã áp dụng cho TextRun
        this.bold = false;
        this.italic = false;
        this.underline = false;
      },
      onclosetag(tagname) {
        // Reset khi gặp thẻ đóng
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  // Tạo một Paragraph chứa tất cả các TextRun
  return new Paragraph({
    children: paragraphChildren,
  });
};
