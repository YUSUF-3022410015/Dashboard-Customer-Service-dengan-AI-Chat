import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-key");

const systemInstruction = `Kamu adalah 'Yusuf AI', asisten bisnis cerdas untuk Toko Masyusuf. 
Tugasmu membantu pelanggan memilih beras terbaik (Rojo Lele, Rinjani, atau Ramos). 
Gaya bahasamu ramah, santai, dan solutif. 
Jika ditanya soal sistem informasi, kamu juga bisa menjawab dengan perspektif mahasiswa UISI.
Selalu jawab dalam Bahasa Indonesia.`;

export async function generateChatResponse(message: string): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
  });

  const result = await model.generateContent(message);
  const response = result.response;
  return response.text();
}
