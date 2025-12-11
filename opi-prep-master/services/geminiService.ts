import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackSection } from "../types";

const apiKey = process.env.API_KEY || '';

export const createGenAIClient = () => {
  if (!apiKey) {
    console.error("API Key is missing!");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFeedback = async (transcript: string): Promise<FeedbackSection> => {
  const ai = createGenAIClient();
  const prompt = `
    You are an ACTFL OPI Master Tester. Analyze the following interview transcript and provide a pedagogical assessment.
    
    TRANSCRIPT:
    ${transcript}
    
    Please provide the output in JSON format with the keys: rating, strengths (array of strings), areasForImprovement (array of strings), tips (array of strings), and detailedAnalysis (string).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rating: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailedAnalysis: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as FeedbackSection;
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      rating: "Error",
      strengths: [],
      areasForImprovement: ["Could not generate report."],
      tips: ["Please try again."],
      detailedAnalysis: "An error occurred while processing the transcript."
    };
  }
};