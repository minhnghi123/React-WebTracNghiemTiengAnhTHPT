import ListeningExam from "../../models/listeningExam.model.js";
import { redisService } from "../../config/redis.config.js";
import { userLog } from "../../utils/logUser.js";

export const index = async (req, res) => {
  try {
    
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
      isDeleted: false, 
      isPublished: true, 
    };

   
    const totalItems = await ListeningExam.countDocuments(condition);

   
    const skip = (currentPage - 1) * limitItems;
    const totalPage = Math.ceil(totalItems / limitItems);

    
    const exams = await ListeningExam.find(condition)
      .populate("questions")
      .populate("audio")
      .populate("teacherId")
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

    // Log user action
    userLog(req, "View Listening Exams", `User accessed listening exams list on page ${currentPage} with limit ${limitItems}`);

    // Cache the result in Redis
    await redisService.set(
      `CACHE_EXAM_PAGE_${currentPage}_LIMIT_${limitItems}`,
      data
    );

    // Return the response
    res.status(200).json(data);
  } catch (error) {
    // Log error
    userLog(req, "View Listening Exams", `Error viewing listening exams: ${error.message}`);
    
    // Handle any errors
    res.status(400).json({ code: 400, message: error.message });
  }
};
