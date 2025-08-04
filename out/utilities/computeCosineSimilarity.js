"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCosineSimilarity = computeCosineSimilarity;
function computeCosineSimilarity(vecA, vecB) {
    console.log("jfaodifjaodfj" + vecA.length, vecB.length);
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Avoid division by zero
    }
    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}
//# sourceMappingURL=computeCosineSimilarity.js.map