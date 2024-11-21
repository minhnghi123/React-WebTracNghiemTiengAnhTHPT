const questionWrappers = document.querySelectorAll(".question-wrapper");

const questionsData = Array.from(questionWrappers).map((questionWrapper) => {
  const questionId = questionWrapper.getAttribute("data-qid");
  const questionNumber = questionWrapper.querySelector(
    ".question-number strong"
  ).textContent;
  const questionText = questionWrapper
    .querySelector(".question-text p")
    .textContent.trim();

  const answers = Array.from(
    questionWrapper.querySelectorAll(".form-check")
  ).map((answer) => {
    const answerLabel = answer
      .querySelector(".form-check-label")
      .textContent.trim();
    const answerValue = answer.querySelector("input").value;

    return { answerValue, answerLabel };
  });

  return {
    questionId,
    questionNumber,
    questionText,
    answers,
  };
});
console.log(questionsData);
fetch("http://localhost:5000/question/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(questionsData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Success:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
