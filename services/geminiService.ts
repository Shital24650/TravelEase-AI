
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TravelPlan, Language, TravelMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTravelPlan = async (
  start: string,
  destination: string,
  mode: TravelMode,
  lang: Language
): Promise<TravelPlan> => {
  const prompt = `
    You are TravelEase, a supportive travel assistant for seniors.
    Create a detailed travel plan from ${start} to ${destination} using ${mode}.
    Language: ${lang}.
    
    If mode is 'Best Option', suggest the most convenient mode for a senior citizen.
    Include step-by-step instructions from home to destination.
    Provide prerequisites (tickets, IDs), estimated travel time, stops, and friendly safety tips.
    Avoid technical jargon.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          travelMode: { type: Type.STRING },
          start: { type: Type.STRING },
          destination: { type: Type.STRING },
          estimatedTime: { type: Type.STRING },
          stops: { type: Type.ARRAY, items: { type: Type.STRING } },
          prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING }
              },
              required: ["title", "instruction"]
            }
          }
        },
        required: ["travelMode", "start", "destination", "estimatedTime", "stops", "prerequisites", "tips", "steps"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithAssistant = async (
  query: string,
  context: string,
  lang: Language
): Promise<string> => {
  const prompt = `
    User Context: ${context}
    Language: ${lang}
    User Query: ${query}
    
    You are TravelEase. Answer the senior user's travel question calmly and clearly.
    Provide actionable advice like where to find help, restrooms, or platform info.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are TravelEase, a supportive assistant for senior citizens traveling. Keep it simple and clear."
    }
  });

  return response.text || "I'm sorry, I couldn't understand that. Please ask again.";
};

export const speakText = async (text: string, lang: Language) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this in ${lang}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const frameCount = dataInt16.length;
      const buffer = audioCtx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS failed", error);
    // Fallback to web speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};
