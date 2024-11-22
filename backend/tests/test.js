const questionWrappers = document.querySelectorAll(".question-wrapper");
const h1 = document.querySelector("h1");
// console.log(h1.textContent.split(":"));
const examTitle = h1.textContent.split(":")[1];
const questionsData = [];
const getExplanation = () => {
  const explanation = document.querySelectorAll(
    ".question-explanation-wrapper .answer-result"
  );

  const explanationObj = [];

  explanation.forEach((ex) => {
    const paragraphs = ex.querySelectorAll("p");

    let knowledge = "";
    let explanations = "";
    let translation = "";

    let checkknow = false,
      checkex = false,
      checktrans = false;

    paragraphs.forEach((p) => {
      const text = p.textContent.trim();

      if (text.startsWith("Kiến thức:") && !checkknow) {
        knowledge += text.replace("Kiến thức:", "").trim();
        checkknow = true;
      } else if (text.startsWith("Giải thích:") && !checkex) {
        explanations += text.replace("Giải thích:", "").trim();
        checkex = true;
      } else if (text.startsWith("Tạm dịch:") && !checktrans) {
        translation += text.replace("Tạm dịch:", "").trim();
        checktrans = true;
      } else {
        if (!checkex && checkknow) {
          knowledge += "\n" + text;
        } else if (!checktrans && checkex) {
          explanations += "\n" + text;
        } else if (checktrans) {
          translation += "\n" + text;
        }
      }
    });
    explanationObj.push({
      knowledge: knowledge.trim(),
      explanations: explanations.trim(),
      translation: translation.trim(),
    });
  });

  return explanationObj;
};

const explanationData = getExplanation();
questionWrappers.forEach((wrapper) => {
  const qid = wrapper.getAttribute("data-qid");

  const content = wrapper.querySelector(".question-content");
  const questionElement = content.querySelector(".question-text");
  const isCorrectHTML = content.querySelector(".text-success").innerHTML;
  const str = isCorrectHTML.split(" ")[2];
  const str2 = str.split(":");

  const trueAnswer = str2[1];

  let questionText = "";
  questionElement.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      questionText += node.textContent.trim() + "\n";
    }
  });

  const answers = [];
  content.querySelectorAll(".form-check").forEach((answer) => {
    const value = answer.querySelector("input").value;
    const label = answer.querySelector("label").innerText;
    answers.push({
      value,
      label,
    });
  });
  for (const ans of answers) {
    // console.log(ans.value, trueAnswer);
    ans["isCorrect"] = ans.value === trueAnswer ? true : false;
  }
  questionsData.push({
    id: qid,
    questionText,
    answers,
  });
});

questionsData.forEach((q, idx) => {
  q["explanationData"] = explanationData[idx];
});

fetch("http://localhost:5000/question/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    examTitle,
    questionsData,
  }),
});
