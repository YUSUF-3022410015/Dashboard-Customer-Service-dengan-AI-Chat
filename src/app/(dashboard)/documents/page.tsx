"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, Loader2, CheckCircle, XCircle, Clock, File, FileSpreadsheet } from "lucide-react";

interface Document {
  id: string;
  title: string;
  file_type: string;
  file_size: number;
  status: "processing" | "ready" | "failed";
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
    case "docx": return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
    default: return <File className="h-5 w-5 text-gray-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ready":
      return <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3 w-3" /> Siap</span>;
    case "processing":
      return <span className="flex items-center gap-1 text-xs text-amber-600"><Loader2 className="h-3 w-3 animate-spin" /> Processing</span>;
    case "failed":
      return <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="h-3 w-3" /> Gagal</span>;
    default:
      return <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="h-3 w-3" /> {status}</span>;
  }
}

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    loadDocuments();
  }, [user]);

  async function loadDocuments() {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch (err) {
      console.error("Load documents error:", err);
    } finally {
      setLoadingDocs(false);
    }
  }

  async function handleUpload(file: File) {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak didukung. Gunakan PDF, DOCX, atau TXT.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal 10MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        loadDocuments();
      } else {
        alert(data.error || "Gagal upload");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal upload file");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dokumen Perusahaan</h1>
        <p className="text-gray-600 mt-1">
          Upload SOP, peraturan, atau prosedur perusahaan. AI akan menjawab berdasarkan dokumen ini.
        </p>
      </div>

      {/* Upload Area */}
      <Card
        className={`mb-8 border-2 border-dashed transition-colors ${
          dragOver ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="py-10 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            {uploading ? "Mengupload..." : "Seret file ke sini atau klik untuk upload"}
          </p>
          <p className="text-sm text-gray-500 mb-4">PDF, DOCX, atau TXT (maks. 10MB)</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Pilih File</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dokumen Tersimpan</CardTitle>
          <CardDescription>
            {documents.length} dokumen dalam knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDocs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada dokumen. Upload SOP atau peraturan perusahaan untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {getFileIcon(doc.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{formatDate(doc.created_at)}</span>
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
