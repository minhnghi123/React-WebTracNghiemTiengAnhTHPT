import { request } from "@/config/request";
import axios from "axios";

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
  getUser: async () => {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
  },
  createUser: async (data: UserDK) => {
    const response = await request.post(`/auth/signup`, data);
    return response;
  },

  login: async (data: User) => {
    console.log(data);
    const response = await request.post("/auth/login", data);
    return response.data;
  },
};
