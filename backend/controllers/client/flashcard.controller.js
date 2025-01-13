import { Vocab } from "../../models/Vocab.model.js";
import { FlashCardSet } from "../../models/FlashCardSet.model.js";
export const createPost = async (req, res) => {
  try {
    const vocabs = req.body.vocabs;
    const vocabPromises = vocabs.map((vocab) => {
      const dataOfVocab = {
        term: vocab.term,
        definition: vocab.definition,
        image: vocab.image || "",
        createdBy: req.user._id,
      };
      const newVocab = new Vocab(dataOfVocab);
      return newVocab.save();
    });
    await Promise.all(vocabPromises);
    const flashCardSet = new FlashCardSet({
      title: req.body.title,
      description: req.body.description,
      vocabs: vocabs.map((vocab) => vocab._id),
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
