import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";

interface ProcessedChunk {
  index: number;
  content: string;
}

function chunkText(text: string, maxChunkSize: number = 1000): ProcessedChunk[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: ProcessedChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({ index: chunkIndex++, content: currentChunk.trim() });
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ index: chunkIndex, content: currentChunk.trim() });
  }

  return chunks;
}

export async function parseFile(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === "pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (fileType === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

export async function processDocument(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  text: string
): Promise<void> {
  try {
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      const { error } = await supabase.from("document_chunks").insert({
        document_id: documentId,
        chunk_index: chunk.index,
        content: chunk.content,
        embedding,
      });

      if (error) {
        console.error(`Error inserting chunk ${chunk.index}:`, error);
        throw error;
      }
    }

    await supabase
      .from("company_documents")
      .update({ status: "ready", updated_at: new Date().toISOString() })
      .eq("id", documentId);
  } catch (error) {
    console.error("Error processing document:", error);
    await supabase
      .from("company_documents")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", documentId);
    throw error;
  }
}

export async function retrieveRelevantChunks(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  matchCount: number = 5,
  matchThreshold: number = 0.3
): Promise<{ content: string; documentTitle: string; similarity: number }[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      p_user_id: userId,
    });

    if (error) {
      console.error("Error retrieving chunks:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      content: row.content,
      documentTitle: row.document_title,
      similarity: row.similarity,
    }));
  } catch (error) {
    console.error("Error in retrieveRelevantChunks:", error);
    return [];
  }
}
