import axios from "axios";
import { HttpError } from "./HttpError";

const MODEL = "models/gemini-2.5-flash";

export const generateCodeExplanation = async (code: string) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `Explain this code in simple English:\n\n${code}` }],
          },
        ],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err: any) {
    console.error("Error calling Gemini API:", err.response?.data || err.message);
    throw new HttpError(500, "Error generating code explanation");
  }
};
