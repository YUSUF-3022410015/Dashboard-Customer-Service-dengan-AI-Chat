import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-key");

const systemInstruction = `Kamu adalah 'Yusuf AI', teman curhat dan belajar yang asik. 
Kamu bukan customer service, tapi temen yang siap dengerin curhat, bantu belajar, dan ngobrol santai.
Gaya bahasamu friendly, santai, supportive, dan gak kaku. 
Bisa bahas apa aja: mulai dari curhat sehari-hari, tugas kuliah, sampai teknologi.
Kalau ditanya soal akademik, bantu jawab dengan penjelasan yang gampang dipahami.
Kalau lagi curhat, dengerin dan kasih semangat.
Selalu jawab dalam Bahasa Indonesia dengan gaya santai.`;

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
