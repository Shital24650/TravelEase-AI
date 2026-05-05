import { TravelPlan, Language, TravelMode } from "../types";

// ✅ Travel Plan
export const generateTravelPlan = async (
  start: string,
  destination: string,
  mode: TravelMode,
  lang: Language
): Promise<TravelPlan> => {
  const prompt = `
  Create a detailed travel plan from ${start} to ${destination} using ${mode}.
  Include:
  - travelMode
  - estimatedTime
  - steps (title + instruction)
  - tips
  - prerequisites
  Language: ${lang}
  Return JSON only.
  `;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  try {
    return JSON.parse(data.text);
  } catch {
    console.error("Parsing failed, raw:", data.text);
    throw new Error("Invalid AI response format");
  }
};


// ✅ Chat Assistant
export const chatWithAssistant = async (
  query: string,
  context: string,
  lang: Language
): Promise<string> => {
  const prompt = `
  Context: ${context}
  Question: ${query}
  Answer clearly for senior users in ${lang}.
  `;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  return data.text;
};


// ✅ Keep simple browser TTS (more stable)
export const speakText = (text: string, lang: Language) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    lang === "Hindi" ? "hi-IN" :
    lang === "Marathi" ? "mr-IN" :
    "en-US";

  speechSynthesis.speak(utterance);
};
