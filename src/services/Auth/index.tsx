import { request } from "@/config/request";

export interface User {
  email: string;
  password: string;
  captchaToken?: string;
  deviceId?: string;
}
export interface UserDK {
  username: string;
  email: string;
  password: string;
  role: string;
}
export const AuthApi = {
  createUser: async (data: UserDK) => {
    const response = await request.post(`/auth/signup`, data);
    return response;
  },
  login: async (data: User) => {
    const response = await request.post("/auth/login", data);
    return response;
  },
  loginOTP: async (email: string, otp: string,deviceId:string) => {
    const response = await request.post("/auth/verify-otp", { email, otp ,deviceId});
    return response;
  }
  ,
  getBlockInfo: async () => {
    const response = await request.get("/auth/blocked-info/");
    return response.data;
  },
  saveTrustedDevice: async (deviceId: string) => {
    const response = await request.post("/auth/save-trusted-device", { deviceId });
    return response.data;
  },
  logout: async () => {
    const response = await request.post("/auth/logout");
    return response;
  },
  forgetPassword: async (email: string) => {
    const response = await request.post(`/auth/forgot-password`, { email });
    return response.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const response = await request.post(`/auth/send-otp`, { email, otp });
    return response.data;
  },
  resetPassword: async (newPassword: string, rePassword: string) => {
    const response = await request.post(`/auth/reset-password`, {
      newPassword,
      rePassword,
    });
    return response.data;
  },
};
