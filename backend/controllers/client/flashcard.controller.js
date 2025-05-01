import { Vocab } from "../../models/Vocab.model.js";
import { FlashCardSet } from "../../models/FlashCardSet.model.js";
import { userLog } from "../../utils/logUser.js";

export const index = async (req, res) => {
  try {
    const flashCardSets = await FlashCardSet.find({
      deleted: false,
    }).populate("vocabs");
    userLog(req, "View FlashCard Sets", "User accessed the list of flashcard sets.");
    res.status(200).json({ flashCardSets });
  } catch (error) {
    userLog(req, "View FlashCard Sets", `Error accessing flashcard sets: ${error.message}`);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xử lý yêu cầu." });
  }
};

export const createPost = async (req, res) => {
  try {
    const vocabs = req.body.vocabs;
    if (!vocabs.length) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp ít nhất một từ vựng." });
    }
    let vocabsId = [];
    const vocabPromises = vocabs.map((vocab) => {
      const dataOfVocab = {
        term: vocab.term,
        definition: vocab.definition,
        image: vocab.image || "",
        createdBy: req.user._id,
      };
      const newVocab = new Vocab(dataOfVocab);
      vocabsId.push(newVocab.id);
      return newVocab.save();
    });

    await Promise.all(vocabPromises);
    const flashCardSet = new FlashCardSet({
      title: req.body.title,
      description: req.body.description,
      vocabs: vocabsId,
      createdBy: req.user._id,
      public: req.body.public || false,
      editable: req.body.editable || false,
      password: req.body.password || "",
    });
    await flashCardSet.save();
    userLog(req, "Create FlashCard Set", `User created a new flashcard set with title: ${req.body.title}`);
    res.status(201).json({
      message: "Tạo thành công bộ flashcard.",
      flashCardSet,
    });
  } catch (error) {
    userLog(req, "Create FlashCard Set", `Error creating flashcard set: ${error.message}`);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình tạo bộ flashcard." });
  }
};

export const updateSet = async (req, res) => {
  try {
    const idSet = req.params.idSet;
    let updatedSet = req.body;
    const checkExisted = await FlashCardSet.findById(idSet);
    if (!checkExisted) {
      return res.status(404).json({ message: "Không tìm thấy bộ flashcard." });
    }
    if (!checkExisted.createdBy.equals(req.user.id)) {
      return res.status(404).json({ message: "Bạn không có quyền chỉnh sửa bộ flashcard này." });
    }
    
    // Xử lý mảng vocabs
    if (updatedSet.vocabs && Array.isArray(updatedSet.vocabs)) {
      const processedVocabs = await Promise.all(updatedSet.vocabs.map(async (vocab) => {
        if (typeof vocab === "object" && !vocab._id) {
          // Tạo mới Vocab nếu chưa có _id
          const dataOfVocab = {
            term: vocab.term,
            definition: vocab.definition,
            image: vocab.image || "",
            createdBy: req.user._id,
          };
          const newVocab = new Vocab(dataOfVocab);
          await newVocab.save();
          return newVocab._id;
        } else if (typeof vocab === "object" && vocab._id) {
          // Nếu đã có _id, trả về _id
          return vocab._id;
        }
        // Nếu vocab là chuỗi (ID), trả về trực tiếp
        return vocab;
      }));
      updatedSet.vocabs = processedVocabs;
    }

    await FlashCardSet.findByIdAndUpdate(idSet, updatedSet, { new: true });
    userLog(req, "Update FlashCard Set", `User updated flashcard set with ID: ${req.params.idSet}`);
    res.status(200).json({ message: "Cập nhật thành công bộ flashcard." });
  } catch (error) {
    userLog(req, "Update FlashCard Set", `Error updating flashcard set: ${error.message}`);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình cập nhật bộ flashcard." });
  }
};

export const detailSet = async (req, res) => {
  try {
    const idSet = req.params.idSet;
    const flashCardSet = await FlashCardSet.findOne({
      _id: idSet,
      deleted: false,
    }).populate("vocabs");
    if (!flashCardSet) {
      return res.status(404).json({ message: "Không tìm thấy bộ flashcard." });
    }
    if (!flashCardSet.public && !flashCardSet.createdBy.equals(req.user.id)) {
      return res
        .status(404)
        .json({ message: "Bạn không có quyền xem bộ flashcard này." });
    }
    userLog(req, "View FlashCard Set Detail", `User viewed details of flashcard set with ID: ${req.params.idSet}`);
    res.status(200).json({ flashCardSet });
  } catch (error) {
    userLog(req, "View FlashCard Set Detail", `Error viewing flashcard set details: ${error.message}`);
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình lấy thông tin bộ flashcard." });
  }
};

export const deleteSet = async (req, res) => {
  try {
    const idSet = req.params.idSet;
    const flashCardSet = await FlashCardSet.findById(idSet);
    if (!flashCardSet) {
      return res.status(404).json({ message: "Không tìm thấy bộ flashcard." });
    }
    if (!flashCardSet.createdBy.equals(req.user.id)) {
      return res
        .status(404)
        .json({ message: "Bạn không có quyền xóa bộ flashcard này." });
    }
    await FlashCardSet.findByIdAndUpdate(idSet, { deleted: true });
    userLog(req, "Delete FlashCard Set", `User deleted flashcard set with ID: ${req.params.idSet}`);
    res.status(200).json({ message: "Xóa bộ flashcard thành công." });
  } catch (error) {
    userLog(req, "Delete FlashCard Set", `Error deleting flashcard set: ${error.message}`);
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa bộ flashcard." });
  }
};
