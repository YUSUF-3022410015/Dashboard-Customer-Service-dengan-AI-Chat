import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Bot, Shield, FileText, Building, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">Partner AI</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Daftar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
            <Building className="h-4 w-4" />
            AI Knowledge Base untuk Internal Perusahaan
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Partner
            <span className="text-emerald-600"> AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Asisten AI yang paham SOP, peraturan, dan prosedur perusahaanmu.
            Upload dokumen internal, dan biarkan AI menjawab pertanyaan karyawan.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Mulai Chat Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sudah Punya Akun?
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Dokumen Internal
            </h3>
            <p className="text-gray-600">
              Upload SOP, peraturan, dan prosedur perusahaan. AI otomatis
              memproses dan memahami isinya.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tanya, AI Jawab
            </h3>
            <p className="text-gray-600">
              Karyawan cukup bertanya seperti "Bagaimana prosedur cuti?".
              AI menjawab berdasarkan dokumen perusahaan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privat & Aman
            </h3>
            <p className="text-gray-600">
              Data perusahaan hanya bisa diakses oleh akun terdaftar.
              Dokumen internal tetap aman dan tidak bocor.
            </p>
          </div>
        </div>

        {/* Developer Info */}
        <div className="mt-24 text-center text-gray-500 text-sm">
          <p>Final Project: AI Chatbot for Business & Academic</p>
          <p className="mt-1">Yusuf Dede Yonaldy - Sistem Informasi UISI</p>
        </div>
      </main>
    </div>
  );
}
