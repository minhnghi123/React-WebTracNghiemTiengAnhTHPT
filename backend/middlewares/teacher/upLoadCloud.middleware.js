import uploadToCloudinary from "../../utils/uploadToClouldinary.js";

// Hàm upload file
const upload = async (req, res, next) => {
  if (req.file) {
    try {
      const link = await uploadToCloudinary(req.file.buffer); // Gọi hàm uploadToCloudinary với buffer file
      req.body[req.file.fieldname] = link; // Gán đường link vào body
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Error uploading to Cloudinary" });
    }
  }
  next(); // Tiến hành tiếp tục qua các middleware tiếp theo
};

// Middleware upload nhiều files (multer.fields)
export const uploadMultiple = async (req, res, next) => {
  if (req.files && Object.keys(req.files).length > 0) {
    try {
      const uploadedFiles = {};

      // Loop qua từng trường fieldname: [file]
      for (const field in req.files) {
        const file = req.files[field][0]; // vì mỗi field chỉ 1 file (maxCount: 1)
        const link = await uploadToCloudinary(file.buffer);
        uploadedFiles[field] = {
          originalname: file.originalname,
          url: link,
        };

        // Gán trực tiếp vào body cho dễ dùng ở controller
        req.body[field] = link;
      }

      req.body.uploadedFiles = uploadedFiles; // optional nếu bạn muốn giữ nguyên metadata
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error uploading files to Cloudinary",
      });
    }
  }

  next();
};

export default upload; // Export default dưới dạng object
