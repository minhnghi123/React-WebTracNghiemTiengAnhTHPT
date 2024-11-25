const data = {
  audios: [],
  questions: [],
};

// Query all audio elements
const audioElements = document.querySelectorAll("audio.post-audio-item");
audioElements.forEach((audio) => {
  const source = audio.querySelector("source").src;
  const transcriptionElement = audio
    .closest(".context-wrapper")
    .querySelector(".context-transcript .collapse.show p");
  const transcription = transcriptionElement
    ? transcriptionElement.textContent.trim()
    : "";
  data.audios.push({
    filePath: source,
    description: "",
    transcription: transcription,
    createdAt: new Date().toISOString(),
  });
});

// Query all question elements
const questionWrappers = document.querySelectorAll(".question-wrapper");
questionWrappers.forEach((wrapper) => {
  const question = {};
  const questionContentElement = wrapper.querySelector(
    ".question-content .question-text"
  );
  const questionContent = questionContentElement
    ? questionContentElement.textContent.trim()
    : "";
  const correctAnswerElement = wrapper.querySelector(".text-success");
  const correctAnswer = correctAnswerElement
    ? correctAnswerElement.textContent.split(":")[1].trim()
    : "";
  const answers = Array.from(
    wrapper.querySelectorAll(".question-answers .form-check")
  ).map((answerWrapper) => {
    const textElement = answerWrapper.querySelector(".form-check-label");
    const text = textElement ? textElement.textContent.trim() : "";
    const isCorrect =
      answerWrapper.querySelector(".form-check-input").value === correctAnswer;
    return { text, isCorrect };
  });

  question.content = questionContent;
  question.answers = answers;
  question.correctAnswer = correctAnswer;

  // Determine question type
  if (wrapper.closest(".questions-wrapper.two-cols")) {
    question.type = "multiple choice";
  } else {
    question.type = "fill in the gap";
  }

  data.questions.push(question);
});

// Query additional content in question-twocols-left and associate with question-twocols-right
const questionTwocolsLeftElements = document.querySelectorAll(
  ".question-twocols-left .context-content"
);
questionTwocolsLeftElements.forEach((element) => {
  const questionContent = element.textContent.trim();
  const rightWrapper = element
    .closest(".question-twocols")
    .querySelector(".question-twocols-right .questions-wrapper");
  if (questionContent && rightWrapper) {
    const answers = Array.from(
      rightWrapper.querySelectorAll(".question-wrapper")
    ).map((wrapper) => {
      const questionTextElement = wrapper.querySelector(
        ".question-content .question-text"
      );
      const questionText = questionTextElement
        ? questionTextElement.textContent.trim()
        : "";
      const correctAnswerElement = wrapper.querySelector(".text-success");
      const correctAnswer = correctAnswerElement
        ? correctAnswerElement.textContent.split(":")[1].trim()
        : "";
      const answerOptions = Array.from(
        wrapper.querySelectorAll(".question-answers .form-check")
      ).map((answerWrapper) => {
        const textElement = answerWrapper.querySelector(".form-check-label");
        const text = textElement ? textElement.textContent.trim() : "";
        const isCorrect =
          answerWrapper.querySelector(".form-check-input").value ===
          correctAnswer;
        return { text, isCorrect };
      });

      return {
        content: questionText,
        answers: answerOptions,
        correctAnswer: correctAnswer,
        type: "fill in the gap",
      };
    });

    data.questions.push({
      content: questionContent,
      answers: answers,
      correctAnswer: "",
      type: "fill in the gap",
    });
  }
});

console.log(data);
