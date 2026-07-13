import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Save user message to database
    if (userId) {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "user",
        content: message,
      });
    }

    // Generate AI response
    const aiResponse = await generateChatResponse(message);

    // Save AI response to database
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
