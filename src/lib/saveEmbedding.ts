import { supabase } from "./supabase";

export async function saveEmbedding(params: {
  userId: string;
  sourceType: "paste" | "autocomplete";
  sourceId: string;
  embedding: number[];
}) {
  const { userId, sourceType, sourceId, embedding } = params;

  const { data, error } = await supabase.from("embeddings").insert([
    {
      user_id: userId,
      source_type: sourceType,
      source_id: sourceId,
      embedding: embedding,
    },
  ]);

  if (error) {
    console.error("Error saving embedding:", error);
    throw error;
  }

  return data;
}
