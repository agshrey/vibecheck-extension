import {
  conceptKeywordMap,
  conceptRegexMap,
} from "../utilities/conceptKeywordMap";
import { getEmbedding } from "../lib/getEmbedding";
import { computeCosineSimilarity } from "../utilities/computeCosineSimilarity";
import { conceptExamples } from "../utilities/conceptExamples";
import { supabase } from "../lib/supabase";

export async function tagSnippet(
  snippet: string,
  userId: string,
  source: string,
  filename: string,
  language: string,
  filepath: string
) {
  const matched: Set<string> = new Set();

  for (const [concept, keywords] of Object.entries(conceptKeywordMap)) {
    if (keywords.some((k) => snippet.includes(k))) {
      matched.add(concept);
    }
  }

  for (const [concept, regexes] of Object.entries(conceptRegexMap)) {
    if (regexes.some((r) => r.test(snippet))) {
      matched.add(concept);
    }
  }

  const snippetEmbedding = await getEmbedding(snippet);
  for (const [concept, examples] of Object.entries(conceptExamples)) {
    for (const example of examples) {
      const exampleEmbedding = await getEmbedding(example);
      if (computeCosineSimilarity(snippetEmbedding, exampleEmbedding) > 0.8) {
        matched.add(concept);
        break; // No need to check further examples for this concept
      }
    }
  }

  if (matched.size !== 0) {
    await supabase.from("tags").insert({
      user_id: userId,
      source_type: source,
      snippet: snippet,
      filename: filename,
      language: language,
      filepath: filepath,
      tags: Array.from(matched),
    });
  }

  for (const concept of Array.from(matched)) {
    console.log(concept);
    const { error } = await supabase.rpc("update_user_concept_score", {
      in_concept: concept,
      in_delta: -0.05,
      in_user_id: userId,
    });

    if (error) {
      console.error("Error updating user concept score:", error);
    }
  }
}
