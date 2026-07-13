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

    const { message, userId, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    let activeConversationId = conversationId;

    // Create new conversation if none provided
    if (!activeConversationId && userId) {
      const title = message.length > 30 ? message.substring(0, 30) + "..." : message;
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title,
        })
        .select("id")
        .single();

      if (convError) {
        console.error("Create conversation error:", convError);
      } else {
        activeConversationId = newConv.id;
      }
    }

    // Save user message
    if (userId && activeConversationId) {
      const { error: insertError } = await supabase.from("chat_messages").insert({
        user_id: userId,
        conversation_id: activeConversationId,
        role: "user",
        content: message,
      });
      if (insertError) console.error("Insert user message error:", insertError);
    }

    // Load conversation history for AI context (last 20 messages)
    let history: { role: "user" | "assistant"; content: string }[] = [];
    if (activeConversationId) {
      const { data: historyData } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true })
        .limit(20);

      if (historyData) {
        history = historyData as { role: "user" | "assistant"; content: string }[];
      }
    }

    // Generate AI response with history context
    const aiResponse = await generateChatResponse(message, history);

    // Save AI response
    if (userId && activeConversationId) {
      const { error: insertError } = await supabase.from("chat_messages").insert({
        user_id: userId,
        conversation_id: activeConversationId,
        role: "assistant",
        content: aiResponse,
      });
      if (insertError) console.error("Insert assistant message error:", insertError);

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversationId);
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: activeConversationId,
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
