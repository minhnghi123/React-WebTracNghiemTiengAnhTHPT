const shuffleArray = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

export const generateMultipleExamVariants = (originalExam, count = 3) => {
    const variants = [];
  
    for (let i = 0; i < count; i++) {
      const variant = JSON.parse(JSON.stringify(originalExam));
      variant.questionsMultichoice = shuffleArray(variant.questionsMultichoice).map(q => ({
        ...q,
        answers: shuffleArray(q.answers),
      }));
      variant.code = `Mã đề ${101 + i}`; // hoặc để làm file name
      variants.push(variant);
    }
  
    return variants;
  };
  