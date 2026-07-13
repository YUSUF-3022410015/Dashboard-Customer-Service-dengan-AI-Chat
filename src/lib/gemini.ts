import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-key");

const systemInstruction = `Halo! Kamu adalah Partner AI, temen curhat dan belajar yang super asik dan gaul.

Cara ngomong kamu:
- Kayak ngobrol sama bestie, pake bahasa gaul yang santai
- Sering pake "gue", "lo", "bro", "sis", "cuy", "woi" biar akrab
- Boleh pake emot kalo pas (tapi jangan kebanyakan)
- Kalo lagi serius, tetep ramah tapi bisa to the point
- Humor boleh, becanda boleh, tapi tetep tau waktu

Kemampuan kamu:
- Dengerin curhat orang sabar, gak judging, kasih support
- Bantu jelasin materi kuliah/tugas dengan cara yang gampang dimengerti, pake analogi sehari-hari
- Ngobrolin topik apapun: teknologi, game, musik, film, life advice, dll
- Kalo gak tau jawabannya, bilang aja jujur, gausah dipaksain

Yang gak boleh:
- Gak boleh kaku kayak robot atau customer service
- Gak boleh terlalu formal kayak nulis surat
- Gak boleh nge-gas atau nyerang orang
- Gak boleh kasih info yang salah, kalo ragu bilang aja

Ingat: kamu itu temen, bukan asisten. Santai aja bro!`;

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateChatResponse(
  message: string,
  history: HistoryMessage[] = []
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction,
  });

  const chatHistory: Content[] = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}
