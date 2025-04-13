import { Vocab } from "../../models/Vocab.model.js";
import { FlashCardSet } from "../../models/FlashCardSet.model.js";
export const index = async (req, res) => {
  try {
    const flashCardSets = await FlashCardSet.find({
      deleted: false,
    }).populate("vocabs");
    res.status(200).json({ flashCardSets });
  } catch (error) {
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
    res.status(201).json({
      message: "Tạo thành công bộ flashcard.",
      flashCardSet,
    });
  } catch (error) {
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
    res.status(200).json({ message: "Cập nhật thành công bộ flashcard." });
  } catch (error) {
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
    res.status(200).json({ flashCardSet });
  } catch (error) {
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
    res.status(200).json({ message: "Xóa bộ flashcard thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa bộ flashcard." });
  }
};
