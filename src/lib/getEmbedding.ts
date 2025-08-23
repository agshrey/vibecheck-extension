import { normalize } from "path";

let extractor: any = null;

export async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    const { pipeline } = await import("@xenova/transformers");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  const result = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(result.data);
}
