import { GoogleGenAI } from "@google/genai";
import { HttpError } from "./HttpError";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateCodeExplanation = async (code: string) => {
  try {
    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: `Explain this code in simple English:\n\n${code}`,
    });

    return response.output_text;
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new HttpError(500, "Error generating code explanation");
  }
};