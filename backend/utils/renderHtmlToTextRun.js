import { Paragraph, TextRun } from "docx";
import * as htmlparser2 from "htmlparser2";

/**
 * Parse inline CSS string (from span style) into a style object.
 */
const parseInlineStyle = (styleStr) => {
  const style = {};
  styleStr.split(";").forEach((rule) => {
    const [prop, value] = rule.split(":").map(s => s?.trim()?.toLowerCase());
    if (!prop || !value) return;

    if (prop === "text-decoration" && value.includes("underline")) {
      style.underline = true;
    }
    if (prop === "font-weight" && value === "bold") {
      style.bold = true;
    }
    if (prop === "font-style" && value === "italic") {
      style.italic = true;
    }
    if (prop === "font-size") {
      const sizeMatch = value.match(/(\d+(?:\.\d+)?)pt/);
      if (sizeMatch) {
        style.size = Math.round(parseFloat(sizeMatch[1]) * 2); // docx uses half-points
      }
    }
  });
  return style;
};

/**
 * Convert HTML to a Paragraph object with styled TextRuns.
 * @param {string} html - The HTML input string.
 * @returns {Paragraph}
 */
export const renderHtmlToTextRun = (html) => {
  const paragraphChildren = [];

  // Initial default style
  const styleStack = [{
    bold: false,
    italic: false,
    underline: false,
    font: "Times New Roman",
    size: 24,
  }];

  const getCurrentStyle = () => styleStack[styleStack.length - 1];

  const parser = new htmlparser2.Parser(
    {
      onopentag(name, attribs) {
        const prev = getCurrentStyle();
        const next = { ...prev };

        if (name === "b") next.bold = true;
        if (name === "i") next.italic = true;
        if (name === "u") next.underline = true;

        if (name === "span" && attribs.style) {
          const inlineStyles = parseInlineStyle(attribs.style);
          Object.assign(next, inlineStyles);
        }

        styleStack.push(next);
      },

      ontext(text) {
        const current = getCurrentStyle();

        // Vẫn render text trắng nếu cần, không filter .trim()
        paragraphChildren.push(
          new TextRun({
            text,
            bold: current.bold,
            italic: current.italic,
            underline: current.underline,
            font: current.font,
            size: current.size,
          })
        );
      },

      onclosetag() {
        styleStack.pop();
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return new Paragraph({ children: paragraphChildren });
};
