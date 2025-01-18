import Groq from "groq-sdk";


const configValue: string = import.meta.env.VITE_GROQ_API_KEY || "default_api_key";

const groq = new Groq({ apiKey: configValue, dangerouslyAllowBrowser: true });

export async function translateEnglishToVietnamese(text: string) {
  console.log(configValue);
  const translationCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Dịch "${text}" từ Anh sang Việt`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
  return translationCompletion.choices[0]?.message?.content || "Không thể dịch từ tiếng Anh sang tiếng Việt";
}


export async function explainInVietnamese(text: string) {
  const explanationCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Giải thích đáp án của câu hỏi về ngữ pháp và nghĩa mà không cần dịch lại câu hỏi:\n"${text}"`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
  return explanationCompletion.choices[0]?.message?.content || "Không thể giải thích từ tiếng Anh sang tiếng Việt";
}
