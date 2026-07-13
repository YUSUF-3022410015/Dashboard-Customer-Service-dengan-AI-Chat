import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di server" },
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
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "user",
        content: message,
      });
    }

    const aiResponse = await generateChatResponse(message);

    if (userId) {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: aiResponse,
      });
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
