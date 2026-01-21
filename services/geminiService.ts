
import { GoogleGenAI } from "@google/genai";
import { ROUTES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusInfoResponse = async (userPrompt: string) => {
  const systemInstruction = `
    You are a DIU (Daffodil International University) Bus Assistant. 
    Users will ask about bus routes, schedules, and general DIU transport info.
    Current available routes: ${JSON.stringify(ROUTES)}.
    Be polite, helpful, and concise. If you don't know the exact real-time location, 
    guide them to check the live map in the app.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The assistant is currently offline. Please check the live map for updates.";
  }
};
