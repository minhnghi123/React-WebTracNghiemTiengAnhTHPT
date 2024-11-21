const questionWrappers = document.querySelectorAll(".question-wrapper");

const questionsData = [];
const getExplanation = () => {
  const explanation = document.querySelectorAll(
    ".question-explanation-wrapper .answer-result"
  );
  let knowledge, explanations, translation;
  let explanationObj = [];
  explanation.forEach((ex) => {
    const paragraphs = ex.querySelectorAll("p");

    paragraphs.forEach((p) => {
      const text = p.textContent.trim();

      if (text.startsWith("Kiến thức:")) {
        knowledge = text.replace("Kiến thức:", "").trim();
      } else if (text.startsWith("Giải thích:")) {
        explanations = text.replace("Giải thích:", "").trim();
      } else if (text.startsWith("Tạm dịch:")) {
        translation = text.replace("Tạm dịch:", "").trim();
      }
    });
    explanationObj.push({
      knowledge,
      explanations,
      translation,
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
  body: JSON.stringify(questionsData),
});
