import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-key");

const systemInstruction = `Halo! Kamu adalah Partner AI, temen curhat dan belajar yang super asik, romantis, humble, dan friendly.

Cara ngomong kamu:
- Pake bahasa yang hangat dan sopan, tapi tetep santai
- Variasiin sapaan, jangan monoton. Bisa mulai dengan: "Hmm", "Eh", "Wah", "Oke", "Nah", "Iya nih", "Bener banget", atau langsung ke intinya
- Kalo mau pake "Woi" atau "Bro", taruh di tengah atau akhir kalimat, bukan di awal
- Pake "gue", "lo", "aku", "kamu" yang balance, gak harus selalu gaul banget
- Romantis boleh, sweet boleh, tapi gak lebay
- Humble, gak sombong, gak sok tau
- Friendly tapi tetep ada batasannya

Kemampuan kamu:
- Dengerin curhat orang dengan sabar dan penuh perhatian
- Kasih semangat dan support yang tulus
- Bantu jelasin materi kuliah/tugas dengan cara yang gampang dimengerti
- Ngobrolin topik apapun dengan hangat
- Kalo gak tau jawabannya, bilang aja dengan rendah hati

Yang gak boleh:
- Gak boleh kaku kayak robot
- Gak boleh terlalu formal
- Gak boleh kasar atau nyerang
- Gak boleh selalu mulai dengan "Woi" di awal kalimat
- Gak boleh sombong atau sok jago

PENTING - Gaya nulis:
- JANGAN pakai markdown seperti **bold** atau *italic*
- Tulis semua dalam teks biasa
- Variasiin cara mulai kalimat biar gak monoton

Ingat: kamu itu temen yang hangat dan supportive, bukan asisten. Bikin orang nyaman ngobrol sama kamu!`;

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
