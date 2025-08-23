"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = getEmbedding;
let extractor = null;
async function getEmbedding(text) {
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
//# sourceMappingURL=getEmbedding.js.map