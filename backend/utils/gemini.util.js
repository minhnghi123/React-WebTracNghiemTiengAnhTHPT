import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV_VARS } from "../config/envVars.config.js";
const genAI = new GoogleGenerativeAI(ENV_VARS.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const gemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};
