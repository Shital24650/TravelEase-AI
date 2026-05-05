import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    const { start, destination, mode, lang } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
    Create a travel plan from ${start} to ${destination} using ${mode}.
    Language: ${lang}.
    Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    res.status(200).json(JSON.parse(response.text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
