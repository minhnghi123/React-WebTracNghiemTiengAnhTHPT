import { VerificationRequest } from "../../models/VerificationRequest.model.js";
import { TaiKhoan } from "../../models/Taikhoan.model.js";
import { generateTokenAndSetToken } from "../../utils/generateToken.util.js";
import { sendMail } from "../../helpers/sendMail.helper.js";

export async function getVerificationRequests(req, res) {
  try {
    const verificationRequests = await VerificationRequest.find();
    res.status(200).json(verificationRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function getDetailVerificationRequest(req, res) {
  try {
    const { requestId } = req.params;
    const verificationRequest = await VerificationRequest.findById(requestId);
    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }
    res.status(200).json(verificationRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function approveTeacher(req, res) {
  try {
    const { requestId } = req.params;
    const verificationRequest = await VerificationRequest.findById(requestId);

    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }

    if (verificationRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Request has already been processed" });
    }

    // Create a new user account for the teacher
    const newUser = new TaiKhoan({
      username: verificationRequest.username,
      email: verificationRequest.email,
      password: verificationRequest.password,
      role: verificationRequest.role,
    });
    await newUser.save();
    generateTokenAndSetToken(newUser._id, res); //jwt
    sendMail(
      newUser.email,
      "Account Approved",
      "Your account has been approved successfully"
    );
    // Update the status of the verification request
    verificationRequest.status = "approved";
    await verificationRequest.save();

    res.status(200).json({ message: "Teacher approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function rejectTeacher(req, res) {
  try {
    const { requestId } = req.params;
    const verificationRequest = await VerificationRequest.findById(requestId);

    if (!verificationRequest) {
      return res
        .status(404)
        .json({ message: "Verification request not found" });
    }

    if (verificationRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Request has already been processed" });
    }

    // Update the status of the verification request
    verificationRequest.status = "rejected";
    await verificationRequest.save();
    sendMail(
      verificationRequest.email,
      "Account Rejected",
      "Your account has been rejected due to a reason you provided"
    );

    res.status(200).json({ message: "Teacher rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
