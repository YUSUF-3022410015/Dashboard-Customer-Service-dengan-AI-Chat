import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const systemInstruction = `Kamu adalah 'Yusuf AI', asisten bisnis cerdas untuk Toko Masyusuf. 
Tugasmu membantu pelanggan memilih beras terbaik (Rojo Lele, Rinjani, atau Ramos). 
Gaya bahasamu ramah, santai, dan solutif. 
Jika ditanya soal sistem informasi, kamu juga bisa menjawab dengan perspektif mahasiswa UISI.
Selalu jawab dalam Bahasa Indonesia.`;

export async function generateChatResponse(message: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
  });

  const result = await model.generateContent(message);
  const response = result.response;
  return response.text();
}
