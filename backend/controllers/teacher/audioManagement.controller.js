import { Audio } from "../../models/Audio.model.js"; 

export const uploadFile = async (req, res) => {
  try {
    // Kiểm tra xem req.body có chứa filePath hay không
    if (req.body.filePath) {
      
      const newAudio = new Audio({
        filePath: req.body.filePath,  
        description: req.body.description || "", 
        transcription: req.body.transcription || "", // Bản dich
      });

      // Lưu đối tượng mới vào MongoDB
      await newAudio.save();

      // Trả về thông tin về file đã upload thành công
      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          filePath: req.body.filePath, // Đường dẫn file
          description: newAudio.description, // Mô tả
          transcription: newAudio.transcription, // Bản ghi
        },
      });
    } else {
      // Trả về lỗi nếu không có filePath
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error uploading file" });
  }
};
