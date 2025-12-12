
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
    
    Please provide the output in JSON format with the following keys:
    - rating: Estimated ILR Level (e.g., Level 1+, Level 2).
    - strengths: Array of strings listing the candidate's strengths.
    - areasForImprovement: Array of strings listing weak points.
    - tips: Array of strings with specific pedagogical advice.
    - detailedAnalysis: A paragraph explaining the rating.
    - vocabulary: Array of strings listing 5-10 useful vocabulary words or phrases relevant to the topics discussed that would improve the candidate's speech (e.g. synonyms for words they overused, or technical terms they missed).
    - grammar: Array of strings listing specific grammar topics the candidate needs to review (e.g., "Past Tense Irregular Verbs", "Subjunctive Mood").
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
            detailedAnalysis: { type: Type.STRING },
            vocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
            grammar: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    
    // Attach the original transcript to the feedback object
    return {
      ...parsed,
      transcript
    } as FeedbackSection;

  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      rating: "Error",
      strengths: [],
      areasForImprovement: ["Could not generate report."],
      tips: ["Please try again."],
      detailedAnalysis: "An error occurred while processing the transcript.",
      transcript: transcript || "No transcript available.",
      vocabulary: [],
      grammar: []
    };
  }
};
