import { supabase } from "../lib/supabase";
import { computeCosineSimilarity } from "../utilities/computeCosineSimilarity";

type Embedding = {
  embedding: number[];
  user_id: string;
  source_type: string;
  source_id: string;
};

export async function findSimilarEmbeddng(
  currentEmbedding: number[],
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("embeddings")
    .select("embedding")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching embeddings:", error);
    return false;
  }

  if (!data || data.length === 0) {
    console.log("No embeddings found for user:", userId);
    return false;
  }

  for (const row of data as Embedding[]) {
    const storedEmbedding =
      typeof row.embedding === "string"
        ? JSON.parse(row.embedding)
        : row.embedding;

    const similarity = computeCosineSimilarity(
      currentEmbedding,
      storedEmbedding
    );

    if (similarity > 0.8) {
      return true;
    }
  }

  return false;
}
