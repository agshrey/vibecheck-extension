"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveEmbedding = saveEmbedding;
const supabase_1 = require("./supabase");
async function saveEmbedding(params) {
    const { userId, sourceType, sourceId, embedding } = params;
    const { data, error } = await supabase_1.supabase.from('embeddings').insert([
        {
            user_id: userId,
            source_type: sourceType,
            source_id: sourceId,
            embedding: embedding
        }
    ]);
    if (error) {
        console.error("Error saving embedding:", error);
        throw error;
    }
    return data;
}
//# sourceMappingURL=saveEmbedding.js.map