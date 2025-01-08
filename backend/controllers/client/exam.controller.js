import Exam from "../../models/Exam.model.js";
import { redisService } from "../../config/redis.config.js";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export const index = async (req, res) => {
  try {
    //pagination
    let currentPage = 1;
    if (req.query.page) {
      currentPage = parseInt(req.query.page);
    }
    let limitItems = 4;
    if (req.query.limit) {
      limitItems = parseInt(req.query.limit);
    }
    const cacheExam = await redisService.get(
      `CACHE_EXAM_PAGE_${currentPage}_LIMIT_${limitItems}`
    );
    if (cacheExam) {
      return res.status(200).json(cacheExam);
    }
    const condition = {
      isPublic: true,
    };
    const totalItems = await Exam.countDocuments({ isPublic: true });

    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);
    const exams = await Exam.find(condition)
      .populate("questions")
      .limit(limitItems)
      .skip(skip);
    const data = {
      code: 200,
      exams,
      currentPage: currentPage,
      totalItems: totalItems,
      totalPage: totalPage,
      limitItems: limitItems,
      hasNextPage: currentPage < totalPage,
    };
    await redisService.set(
      `CACHE_EXAM_PAGE_${currentPage}_LIMIT_${limitItems}`,
      data
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message });
  }
};
export const detailExam = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheDetailExam = await redisService.get(
      `CACHE_DETAIL_EXAMPLE_${slug}`
    );
    if (cacheDetailExam) {
      return res.status(200).json(cacheDetailExam);
    }
    const exam = await Exam.findOne({ slug }).populate("questions");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    await redisService.set(`CACHE_DETAIL_EXAMPLE_${slug}`, { code: 200, exam });
    res.status(200).json({ code: 200, exam });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message });
  }
};
export const joinedExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.examId }).populate(
      "questions"
    );
    if (!exam) {
      return res.status(404).json({ message: "Đề thi không tồn tại." });
    }
    // const now = new Date();
    // if (now < exam.startTime || (exam.endTime && now > exam.endTime)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Đề thi không khả dụng hoặc đã kết thúc." });
    // }
    // Đảo câu hỏi
    const shuffledQuestions = shuffleArray(exam.questions);
    console.log(shuffledQuestions);
    // Đảo đáp án cho từng câu hỏi
    const questionsWithShuffledAnswers = shuffledQuestions.map((question) => {
      return {
        ...question.toObject(),
        answers: shuffleArray(question.answers),
      };
    });
    res.status(200).json({
      code: 200,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questions: questionsWithShuffledAnswers,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: 400, message: "Lỗi khi tham gia đề thi." });
  }
};
