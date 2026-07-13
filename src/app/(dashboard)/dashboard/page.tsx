"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, Bot, TrendingUp } from "lucide-react";

interface Stats {
  totalMessages: number;
  totalUsers: number;
  todayMessages: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalUsers: 0,
    todayMessages: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchStats() {
      const { count: totalMessages } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true });

      const { count: totalUsers } = await supabase
        .from("chat_messages")
        .select("user_id", { count: "exact", head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayMessages } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      setStats({
        totalMessages: totalMessages || 0,
        totalUsers: totalUsers || 0,
        todayMessages: todayMessages || 0,
      });
    }

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pesan
            </CardTitle>
            <MessageCircle className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMessages}</div>
            <CardDescription className="text-xs mt-1">
              Semua percakapan yang tersimpan
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pengguna Unik
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <CardDescription className="text-xs mt-1">
              Jumlah pengguna yang aktif
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pesan Hari Ini
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayMessages}</div>
            <CardDescription className="text-xs mt-1">
              Aktivitas chat hari ini
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600" />
            Tentang Yusuf AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Yusuf AI adalah temen curhat dan belajar berbasis AI.
            Didukung oleh Google Gemini AI model gemini-2.0-flash.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <p className="font-medium text-emerald-800">Fitur:</p>
              <p className="text-emerald-600">Curhat, Belajar, Ngobrol</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-800">Teknologi:</p>
              <p className="text-blue-600">Next.js, Supabase, Gemini AI</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p><strong>Pengembang:</strong> Yusuf Dede Yonaldy</p>
            <p><strong>Program Studi:</strong> Sistem Informasi UISI</p>
            <p><strong>Final Project:</strong> AI Chatbot for Business & Academic</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
