import { Vocab } from "../../models/Vocab.model.js";
import { FlashCardSet } from "../../models/FlashCardSet.model.js";
export const index = async (req, res) => {
  try {
    const flashCardSets = await FlashCardSet.find({
      deleted: false,
    }).populate("vocabs");
    res.status(200).json({ flashCardSets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const vocabs = req.body.vocabs;
    if (!vocabs.length) {
      return res
        .status(400)
        .json({ message: "Please provide at least one vocab" });
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
      message: "Created successfully",
      flashCardSet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSet = async (req, res) => {
  try {
    const idSet = req.params.idSet;
    let updatedSet = req.body;
    const checkExisted = await FlashCardSet.findById(idSet);
    if (!checkExisted) {
      return res.status(404).json({ message: "Flash card set not found" });
    }
    if (!checkExisted.createdBy.equals(req.user.id)) {
      return res.status(404).json({ message: "You don't have permission to update this card set" });
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
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: "Flash card set not found" });
    }
    if (!flashCardSet.public && !flashCardSet.createdBy.equals(req.user.id)) {
      return res
        .status(404)
        .json({ message: "You don't have permission to view this card set" });
    }
    res.status(200).json({ flashCardSet });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSet = async (req, res) => {
  try {
    const idSet = req.params.idSet;
    const flashCardSet = await FlashCardSet.findById(idSet);
    if (!flashCardSet) {
      return res.status(404).json({ message: "Flash card set not found" });
    }
    if (!flashCardSet.createdBy.equals(req.user.id)) {
      return res
        .status(404)
        .json({ message: "You don't have permission to delete this card set" });
    }
    await FlashCardSet.findByIdAndUpdate(idSet, { deleted: true });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
