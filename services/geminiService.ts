import { TravelPlan, Language, TravelMode } from "../types";

// 🔹 Travel Plan
export const generateTravelPlan = async (
  start: string,
  destination: string,
  mode: TravelMode,
  lang: Language
): Promise<TravelPlan> => {

  const prompt = `
  Create a detailed travel plan from ${start} to ${destination} using ${mode}.
  Language: ${lang}

  Return ONLY JSON in this format:
  {
    "travelMode": "",
    "start": "",
    "destination": "",
    "estimatedTime": "",
    "stops": [],
    "prerequisites": [],
    "tips": [],
    "steps": [
      { "title": "", "instruction": "" }
    ]
  }
  `;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API failed");
  }

  // ✅ If JSON came correctly
  if (data.travelMode) return data;

  // ❌ fallback if AI returned text
  console.error("Invalid JSON:", data);
  throw new Error("AI response not in correct format");
};


// 🔹 Chat Assistant
export const chatWithAssistant = async (
  query: string,
  context: string,
  lang: Language
): Promise<string> => {

  const prompt = `
  Context: ${context}
  Question: ${query}
  Answer clearly for senior users in ${lang}.
  Keep it short and helpful.
  `;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Chat failed");
  }

  // If structured response
  if (data.response) return data.response;

  // If raw text fallback
  if (data.raw) return data.raw;

  return "Sorry, I couldn't understand. Please try again.";
};


// 🔹 Simple TTS (stable)
export const speakText = (text: string, lang: Language) => {
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang =
    lang === "Hindi" ? "hi-IN" :
    lang === "Marathi" ? "mr-IN" :
    "en-US";

  speechSynthesis.speak(utterance);
};
