import uploadToCloudinary from "../../utils/uploadToClouldinary.js"; 

// Hàm upload file
const upload = async (req, res, next) => {
  if (req.file) {
    try {
      const link = await uploadToCloudinary(req.file.buffer); // Gọi hàm uploadToCloudinary với buffer file
      req.body[req.file.fieldname] = link; // Gán đường link vào body
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Error uploading to Cloudinary' });
    }
  }
  next(); // Tiến hành tiếp tục qua các middleware tiếp theo
};

export default  upload ; // Export default dưới dạng object
