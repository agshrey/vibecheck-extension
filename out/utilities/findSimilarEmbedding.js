"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSimilarEmbeddng = findSimilarEmbeddng;
const supabase_1 = require("../lib/supabase");
const computeCosineSimilarity_1 = require("../utilities/computeCosineSimilarity");
async function findSimilarEmbeddng(currentEmbedding, userId) {
    const { data, error } = await supabase_1.supabase
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
    for (const row of data) {
        const storedEmbedding = typeof row.embedding === "string"
            ? JSON.parse(row.embedding)
            : row.embedding;
        const similarity = (0, computeCosineSimilarity_1.computeCosineSimilarity)(currentEmbedding, storedEmbedding);
        if (similarity > 0.8) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=findSimilarEmbedding.js.map