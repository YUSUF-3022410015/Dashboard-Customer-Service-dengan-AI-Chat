"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Menu } from "lucide-react";
import { ConversationSidebar } from "@/components/ConversationSidebar";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as Message[]);
      } else {
        setMessages([]);
      }
    }

    loadMessages();
  }, [activeConversationId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    try {
      // Create conversation from client side if needed (so RLS works)
      let convId = activeConversationId;
      if (!convId && user) {
        const title = userMessage.length > 30 ? userMessage.substring(0, 30) + "..." : userMessage;
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title })
          .select("id")
          .single();

        if (convError) {
          console.error("Create conversation error:", convError);
          setSending(false);
          return;
        } else if (newConv) {
          convId = newConv.id;
          setActiveConversationId(convId);
        }
      }

      if (!convId) {
        setSending(false);
        return;
      }

      // Add user message to UI after conversation is confirmed
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          conversationId: convId,
        }),
      });

      const data = await res.json();

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        setSidebarRefreshKey((k) => k + 1);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Waduh, ada kendala teknis. Coba lagi ya!",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, visible on lg */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <ConversationSidebar
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          refreshKey={sidebarRefreshKey}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden flex items-center gap-3 p-3 border-b bg-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-gray-900">Yusuf AI</span>
        </div>

        {/* Messages or Welcome Screen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !activeConversationId ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hey! Ada yang bisa dibantu?
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Yusuf AI siap jadi temen curhat, tanya tugas, atau sekadar ngobrol santai.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  "Gimana cara belajar TypeScript?",
                  "Aku lagi stress sama tugas nih",
                  "Jelasin dong soal database!",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-sm bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-emerald-600" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] lg:max-w-[70%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3 lg:p-4 bg-white">
          <div className="flex gap-2 lg:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan Anda..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center hidden sm:block">
            Powered by Google Gemini AI - Final Project Sistem Informasi UISI
          </p>
        </div>
      </div>
    </div>
  );
}
