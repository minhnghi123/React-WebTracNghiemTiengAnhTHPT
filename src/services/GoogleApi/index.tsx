import { GoogleGenerativeAI } from "@google/generative-ai";
const configValue: string = import.meta.env.VITE_GEMINI_API_KEY || "default_api_key";
const genAI = new GoogleGenerativeAI(configValue);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const gemini = async (prompt: string) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};
