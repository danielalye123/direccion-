import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatResponse(messages: { role: 'user' | 'model', parts: { text: string }[] }[], systemInstruction: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Lo siento, no pude procesar tu mensaje.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Hubo un problema al conectar con mi cerebro artificial. ¿Podrías intentarlo de nuevo?";
  }
}
