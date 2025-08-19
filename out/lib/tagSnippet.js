"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagSnippet = tagSnippet;
const conceptKeywordMap_1 = require("../utilities/conceptKeywordMap");
const getEmbedding_1 = require("../lib/getEmbedding");
const computeCosineSimilarity_1 = require("../utilities/computeCosineSimilarity");
const conceptExamples_1 = require("../utilities/conceptExamples");
const supabase_1 = require("../lib/supabase");
async function tagSnippet(snippet, userId, source, filename, language, filepath) {
    const matched = new Set();
    for (const [concept, keywords] of Object.entries(conceptKeywordMap_1.conceptKeywordMap)) {
        if (keywords.some((k) => snippet.includes(k))) {
            matched.add(concept);
        }
    }
    for (const [concept, regexes] of Object.entries(conceptKeywordMap_1.conceptRegexMap)) {
        if (regexes.some((r) => r.test(snippet))) {
            matched.add(concept);
        }
    }
    const snippetEmbedding = await (0, getEmbedding_1.getEmbedding)(snippet);
    for (const [concept, examples] of Object.entries(conceptExamples_1.conceptExamples)) {
        for (const example of examples) {
            const exampleEmbedding = await (0, getEmbedding_1.getEmbedding)(example);
            if ((0, computeCosineSimilarity_1.computeCosineSimilarity)(snippetEmbedding, exampleEmbedding) > 0.8) {
                matched.add(concept);
                break; // No need to check further examples for this concept
            }
        }
    }
    if (matched.size !== 0) {
        await supabase_1.supabase.from("tags").insert({
            user_id: userId,
            source_type: source,
            snippet: snippet,
            filename: filename,
            language: language,
            filepath: filepath,
            tags: Array.from(matched),
        });
    }
}
//# sourceMappingURL=tagSnippet.js.map