import axios from "axios";
import { HttpError } from "./HttpError";


export const generateCodeExplanation = async (code: string) => {
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Explain this code in simple English and make a sentance.Act as a mentor:\n\n${code}` }],
                    },
                ],
            },
            {
                params: { key: process.env.GEMINI_API_KEY },
                headers: { 'Content-Type': 'application/json' },
            }
        );

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation found';
    } catch (error) {
        console.log(error)
        throw new HttpError(500, "server errro while generating code explanation")
    }
}