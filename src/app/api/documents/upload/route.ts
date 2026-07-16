import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { parseFile, processDocument } from "@/lib/document-processor";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File terlalu besar. Maksimal 10MB" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "text/plain"];
    const allowedDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (![...allowedTypes, allowedDocx].includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan PDF, DOCX, atau TXT" }, { status: 400 });
    }

    let fileType = "txt";
    if (file.type === "application/pdf") fileType = "pdf";
    else if (file.type === allowedDocx) fileType = "docx";

    const { data: doc, error: docError } = await supabase
      .from("company_documents")
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.(pdf|docx|txt)$/i, ""),
        file_type: fileType,
        file_size: file.size,
        status: "processing",
      })
      .select("id")
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Gagal menyimpan dokumen" }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseFile(buffer, fileType);

    processDocument(supabase, user.id, doc.id, text).catch((err) => {
      console.error("Background processing error:", err);
    });

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      message: "Dokumen berhasil diupload. Proses embedding berjalan di background.",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
