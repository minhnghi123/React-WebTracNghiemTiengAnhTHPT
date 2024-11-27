import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_KEY, 
  api_secret: process.env.CLOUD_SECRET 
});

let streamUpload = (buffer) => {
  return new Promise((resolve, reject) => { 
    let stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Tự động phát hiện loại tài nguyên (image, video, audio, ...)
        folder: 'audio_uploads_WebsiteEnglish', // Lưu trong thư mục audio_uploads_WebsiteEnglish
      },
      (error, result) => {
        if (result) {
          resolve(result); // Trả kết quả upload
        } else {
          reject(error); // Nếu có lỗi thì reject
        }
      }
    );

    // Tạo stream từ buffer và pipe vào Cloudinary
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Sử dụng export default
const uploadToCloudinary = async (buffer) => {
  try {
    let result = await streamUpload(buffer);
    return result.secure_url; // Trả về URL bảo mật của file trên Cloudinary
  } catch (error) {
    console.error(error);
    throw new Error('Error uploading to Cloudinary'); // Nếu có lỗi xảy ra, ném lỗi
  }
};

export default uploadToCloudinary;
