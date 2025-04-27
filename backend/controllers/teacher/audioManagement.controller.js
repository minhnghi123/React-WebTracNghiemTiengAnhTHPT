import { Audio } from "../../models/Audio.model.js"; 

// [POST]: teacher/audio/upload
export const createAudio  = async (req, res) => {
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
      console.log('New audio created:', newAudio);

      // Trả về thông tin về file đã upload thành công
      return res.status(200).json({
        success: true,
        message: "Tải tệp lên thành công",
        data: {
          _id: newAudio._id, // ID của audio
          filePath: req.body.filePath, // Đường dẫn file
          description: newAudio.description, // Mô tả
          transcription: newAudio.transcription, // Bản ghi
        },
      });
    } else {
      // Trả về lỗi nếu không có filePath
      return res.status(400).json({ success: false, message: "Không có tệp nào được tải lên" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi khi tải tệp lên" });
  }
};

// [GET]: teacher/audio/
export const getAllAudios = async (req, res) => {
  try {
    const filter = {
      isDeleted: false
    }
    const audios = await Audio.find(filter);
    res.status(200).json(audios);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách audio", error });
  }
};

// [PATCH]: teacher/audio/update/:id
export const updateAudio = async (req, res) => {
  try {
    const { id } = req.params;  // Lấy ID từ params
    const { filePath, description, transcription } = req.body;  // Lấy các thông tin cần cập nhật từ body

    // Kiểm tra nếu filePath được cung cấp, nếu không giữ nguyên giá trị hiện tại
    const updateData = {
      filePath: filePath || undefined,  
      description: description || undefined,  
      transcription: transcription || undefined,  
    };

    // Tìm và cập nhật thông tin của audio theo ID
    const updatedAudio = await Audio.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedAudio) {
      return res.status(404).json({ success: false, message: "Không tìm thấy audio" });
    }

    // Trả về thông tin audio đã được cập nhật
    return res.status(200).json({
      success: true,
      message: "Cập nhật audio thành công",
      data: updatedAudio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi khi cập nhật audio" });
  }
};

// [PATCH]: teacher/audio/delete/:id
export const softDeleteAudio = async (req, res) => {
  try {
    const { id } = req.params;  // Lấy ID của audio từ params

    // Tìm và cập nhật trạng thái xóa mềm cho audio
    const deletedAudio = await Audio.findByIdAndUpdate(id, {
      isDeleted: true,            
      deletedAt: new Date(),     
    }, { new: true });

    if (!deletedAudio) {
      return res.status(404).json({ success: false, message: "Không tìm thấy audio" });
    }

    // Trả về thông tin audio sau khi đã xóa mềm
    return res.status(200).json({
      success: true,
      message: "Xóa mềm audio thành công",
      data: deletedAudio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi khi xóa audio" });
  }
};
