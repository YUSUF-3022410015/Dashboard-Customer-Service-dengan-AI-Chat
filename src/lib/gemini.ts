import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function generateChatResponse(message: string): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction,
  });

  const result = await model.generateContent(message);
  const response = result.response;
  return response.text();
}
