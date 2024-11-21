import { request } from "@/config/request";

export interface User {
  email: string;
  password: string;
}
export interface UserDK {
  username: string;
  email: string;
  password: string;
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
  logout: async () => {
    const response = await request.post("/auth/logout");
    return response;
  },
};
