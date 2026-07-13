import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY tidak ditemukan di environment variables Vercel" },
        { status: 500 }
      );
    }

    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    if (userId) {
      const { error: insertError } = await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "user",
        content: message,
      });
      if (insertError) console.error("Insert user message error:", insertError);
    }

    const aiResponse = await generateChatResponse(message);

    if (userId) {
      const { error: insertError } = await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: aiResponse,
      });
      if (insertError) console.error("Insert assistant message error:", insertError);
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
