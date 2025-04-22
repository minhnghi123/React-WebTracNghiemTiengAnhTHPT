const shuffleArray = (arr) => {
  return Array.isArray(arr) ? [...arr].sort(() => Math.random() - 0.5) : [];
};

export const generateMultipleExamVariants = (originalExam, count = 3) => {
  const variants = [];

  for (let i = 0; i < count; i++) {
    const variant = JSON.parse(JSON.stringify(originalExam));
    variant.questions = shuffleArray(variant.questions).map((q) => ({
      ...q,
      answers: shuffleArray(q.answers),
    }));
    variant.listeningExams = shuffleArray(variant.listeningExams || []);
    variant.code = `Mã đề ${101 + i}`;
    variants.push(variant);
  }

  return variants;
};
