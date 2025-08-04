"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = getEmbedding;
let extractor = null;
async function getEmbedding(text) {
    if (!extractor) {
        const { pipeline } = await import('@xenova/transformers');
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const result = await extractor(text, {
        pooling: "mean",
        normalize: true,
    });
    console.log("Raw result:", result);
    console.log("result.data:", result.data);
    console.log("typeof result.data[0]:", typeof result.data[0]);
    console.log("result.data[0] instanceof Array:", result.data[0] instanceof Array);
    console.log("result.data[0].slice:", result.data[0].slice); // should be a function
    return Array.from(result.data);
}
//# sourceMappingURL=getEmbedding.js.map