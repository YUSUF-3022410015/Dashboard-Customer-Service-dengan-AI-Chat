"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { MessageSquare, Plus, Trash2, X } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  refreshKey: number;
  onClose?: () => void;
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  refreshKey,
  onClose,
}: ConversationSidebarProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      if (!user) return;
      setLoading(true);

      console.log("Loading conversations for user:", user.id);
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Load conversations error:", error);
      } else {
        console.log("Conversations loaded:", data?.length, data);
      }

      if (data) {
        setConversations(data as Conversation[]);
      }
      setLoading(false);
    }

    loadConversations();
  }, [user, refreshKey]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus conversation ini?")) return;

    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));

    if (activeConversationId === id) {
      onNewChat();
    }
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onClose?.();
  };

  const handleNew = () => {
    onNewChat();
    onClose?.();
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col">
      {/* Header with close button on mobile */}
      <div className="p-3 flex items-center justify-between border-b border-gray-700">
        <span className="font-semibold text-sm">Chat History</span>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading ? (
          <div className="text-center text-gray-400 text-sm py-4">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">Belum ada chat</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors ${
                activeConversationId === conv.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm flex-1 min-w-0">{conv.title}</span>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
        Yusuf AI - Curhat & Belajar
      </div>
    </div>
  );
}
