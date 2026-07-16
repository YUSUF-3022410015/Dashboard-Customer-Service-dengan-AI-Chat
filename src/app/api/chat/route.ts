import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase-server";
import { retrieveRelevantChunks } from "@/lib/document-processor";

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

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Save user message
    if (userId) {
      const { error: insertError } = await supabase.from("chat_messages").insert({
        user_id: userId,
        conversation_id: conversationId,
        role: "user",
        content: message,
      });
      if (insertError) console.error("Insert user message error:", insertError);
    }

    // Load conversation history for AI context (last 20 messages, excluding current)
    let history: { role: "user" | "assistant"; content: string }[] = [];
    const { data: historyData } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(21);

    if (historyData && historyData.length > 0) {
      // Remove the last message (current user message) from history
      history = historyData.slice(0, -1) as { role: "user" | "assistant"; content: string }[];
    }

    // RAG: Retrieve relevant document chunks for context
    let documentContext = "";
    if (userId) {
      const chunks = await retrieveRelevantChunks(supabase, userId, message);
      if (chunks.length > 0) {
        documentContext = chunks
          .map((c) => `[Dari dokumen: ${c.documentTitle}]\n${c.content}`)
          .join("\n\n---\n\n");
      }
    }

    // Generate AI response with history context + document context
    const aiResponse = await generateChatResponse(message, history, documentContext);

    // Save AI response
    if (userId) {
      const { error: insertError } = await supabase.from("chat_messages").insert({
        user_id: userId,
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
      });
      if (insertError) console.error("Insert assistant message error:", insertError);

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
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
