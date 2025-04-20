import { VerificationRequest } from "../../models/VerificationRequest.model.js";
import { TaiKhoan } from "../../models/Taikhoan.model.js";
import { generateTokenAndSetToken } from "../../utils/generateToken.util.js";
import { sendMail } from "../../helpers/sendMail.helper.js";

// Ensure the sendMail helper is configured with valid SMTP credentials
// Example: Check the sendMail.helper.js file for proper configuration

export async function getVerificationRequests(req, res) {
  try {
    const verificationRequests = await VerificationRequest.find();
    res.status(200).json(verificationRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
}
export async function getDetailVerificationRequest(req, res) {
  try {
    const { requestId } = req.params;
    const verificationRequest = await VerificationRequest.findById(requestId);
    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu xác minh" });
    }
    res.status(200).json(verificationRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
}
export async function approveTeacher(req, res) {
  try {
    const { requestId } = req.params;
    const verificationRequest = await VerificationRequest.findById(requestId);

    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu xác minh" });
    }

    if (verificationRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Yêu cầu đã được xử lý" });
    }

    // Create a new user account for the teacher
    const newUser = new TaiKhoan({
      username: verificationRequest.username,
      email: verificationRequest.email,
      password: verificationRequest.password,
      role: verificationRequest.role,
    });
    await newUser.save();
    // generateTokenAndSetToken(newUser._id, res); //jwt
    sendMail(
      newUser.email,
      "Tài khoản đã được phê duyệt",
      "Tài khoản của bạn đã được phê duyệt thành công"
    );
    // Update the status of the verification request
    verificationRequest.status = "approved";
    await verificationRequest.save();

    res.status(200).json({ message: "Phê duyệt giáo viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
}

export async function rejectTeacher(req, res) {
  try {
    const { requestId } = req.params;
    const verificationRequest = await VerificationRequest.findById(requestId);

    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu xác minh" });
    }

    if (verificationRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Yêu cầu đã được xử lý" });
    }

    // Update the status of the verification request
    verificationRequest.status = "rejected";
    await verificationRequest.save();
    sendMail(
      verificationRequest.email,
      "Tài khoản bị từ chối",
      "Tài khoản của bạn đã bị từ chối"
    );

    res.status(200).json({ message: "Từ chối giáo viên thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
}
