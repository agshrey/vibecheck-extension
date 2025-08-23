"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTabDetection = registerTabDetection;
const vscode = __importStar(require("vscode"));
const supabase_1 = require("../lib/supabase");
const pasteGemini_1 = require("../api/pasteGemini");
const getSurroundingContext_1 = require("../utilities/getSurroundingContext");
const getAsciiProgressBar_1 = require("../utilities/getAsciiProgressBar");
const findSimilarEmbedding_1 = require("../utilities/findSimilarEmbedding");
const getEmbedding_1 = require("../lib/getEmbedding");
const saveEmbedding_1 = require("../lib/saveEmbedding");
const uuid_1 = require("uuid");
const tagSnippet_1 = require("../lib/tagSnippet");
let lastInsertedText = null;
let lastInsertedPosition = null;
let lastDocUri = null;
function registerTabDetection(context) {
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || event.document !== editor.document) {
            return;
        }
        const change = event.contentChanges[0];
        if (!change || change.rangeLength === 0 || change.text.length < 100) {
            return;
        }
        lastInsertedText = change.text;
        lastInsertedPosition = change.range.start;
        lastDocUri = event.document.uri;
        const { topContext, bottomContext } = (0, getSurroundingContext_1.getSurroundingContext)(editor.document, lastInsertedPosition, 5);
        if (context.globalState.get("loggedIn") !== true) {
            return;
        }
        if (context.globalState.get("spectatorModeEnabled")) {
            await supabase_1.supabase.from("autocompletes").insert({
                user_id: context.globalState.get("userId"),
                filename: editor.document.fileName,
                filepath: editor.document.uri.fsPath,
                language: editor.document.languageId,
                autocompleted_code: lastInsertedText,
                top_context_code: topContext,
                bottom_context_code: bottomContext,
                user_explanation: "",
                gemini_score: 0,
                gemini_critique: "",
                gemini_suggestion: "",
                spectator_mode: true,
                deleted: true,
                bypass: false,
            });
            return;
        }
        const embedding = await (0, getEmbedding_1.getEmbedding)(lastInsertedText);
        const embedding_id = (0, uuid_1.v4)();
        if (!embedding) {
            vscode.window.showErrorMessage("Failed to generate embedding for the autocompleted code.");
            return;
        }
        if (await (0, findSimilarEmbedding_1.findSimilarEmbeddng)(embedding, context.globalState.get("userId") || (0, uuid_1.v4)())) {
            await (0, saveEmbedding_1.saveEmbedding)({
                userId: context.globalState.get("userId") || (0, uuid_1.v4)(),
                sourceType: "autocomplete",
                sourceId: embedding_id,
                embedding: embedding,
            });
            await supabase_1.supabase.from("autocompletes").insert({
                user_id: context.globalState.get("userId"),
                filename: editor.document.fileName,
                filepath: editor.document.uri.fsPath,
                language: editor.document.languageId,
                autocompleted_code: lastInsertedText,
                top_context_code: topContext,
                bottom_context_code: bottomContext,
                user_explanation: "",
                gemini_score: 0,
                gemini_critique: "",
                gemini_suggestion: "",
                spectator_mode: false,
                deleted: false,
                bypass: true,
            });
            const decoration = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: "<-- Similar code detected! bypassed explanation.",
                    margin: "10px",
                    color: "#ffa200ff",
                    fontStyle: "italic",
                },
                isWholeLine: true,
            });
            const range = new vscode.Range(lastInsertedPosition.line, 0, lastInsertedPosition.line, 0);
            editor.setDecorations(decoration, [{ range }]);
            setTimeout(() => editor.setDecorations(decoration, []), 3000);
            return;
        }
        const explanation = await vscode.window.showInputBox({
            prompt: "Explain the autocompleted code:",
            placeHolder: "Enter your explanation here",
        });
        if (!explanation) {
            const insertedLines = lastInsertedText.split("\n");
            const endLine = lastInsertedPosition.line + insertedLines.length - 1;
            const endChar = insertedLines[insertedLines.length - 1].length;
            const deleteRange = new vscode.Range(lastInsertedPosition, new vscode.Position(endLine, endChar));
            const edit = new vscode.WorkspaceEdit();
            edit.delete(editor.document.uri, deleteRange);
            await vscode.workspace.applyEdit(edit);
            const range = new vscode.Range(lastInsertedPosition.line, 0, lastInsertedPosition.line, 0);
            const decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: "<-- Autocompleted code deleted!",
                    margin: "10px",
                    color: "#ff0000",
                    fontStyle: "italic",
                },
                isWholeLine: true,
            });
            editor.setDecorations(decorationType, [{ range }]);
            setTimeout(() => editor.setDecorations(decorationType, []), 3000);
            return;
        }
        const feedback = await (0, pasteGemini_1.getGeminiFeedback)(lastInsertedText, explanation, editor.document.fileName, editor.document.languageId, topContext, bottomContext);
        if (!feedback) {
            vscode.window.showErrorMessage("Failed to get feedback from Gemini.");
            return;
        }
        const parsedFeedback = JSON.parse(feedback);
        let scoreEmoji = "";
        if (parsedFeedback.score <= 3) {
            scoreEmoji = "🔴 Poor Explanation";
        }
        else if (parsedFeedback.score <= 7) {
            scoreEmoji = "🟡 Could be better";
        }
        else {
            scoreEmoji = "🟢 Good Job";
        }
        const output = vscode.window.createOutputChannel("VibeCheck Feedback");
        output.show(true);
        output.appendLine("🌟 Vibe Check Feedback\n");
        output.appendLine(scoreEmoji + "\n");
        output.appendLine(`Score: ${(0, getAsciiProgressBar_1.getAsciiProgressBar)(parsedFeedback.score)}\n`);
        output.appendLine(`Critique: ${parsedFeedback.critique}\n`);
        output.appendLine(`Suggestion: ${parsedFeedback.suggestion}`);
        const insertedLines = lastInsertedText.split("\n");
        const endLine = lastInsertedPosition.line + insertedLines.length - 1;
        const endChar = insertedLines[insertedLines.length - 1].length;
        if (parsedFeedback.score < 4) {
            const deleteRange = new vscode.Range(lastInsertedPosition, new vscode.Position(endLine, endChar));
            const edit = new vscode.WorkspaceEdit();
            edit.delete(editor.document.uri, deleteRange);
            await vscode.workspace.applyEdit(edit);
            const range = new vscode.Range(lastInsertedPosition.line, 0, lastInsertedPosition.line, 0);
            const decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: "<-- Autocompleted code deleted!",
                    margin: "10px",
                    color: "#ff0000",
                    fontStyle: "italic",
                },
                isWholeLine: true,
            });
            editor.setDecorations(decorationType, [{ range }]);
            setTimeout(() => editor.setDecorations(decorationType, []), 3000);
        }
        else {
            const lastLine = lastInsertedPosition.line + insertedLines.length - 1;
            const range = new vscode.Range(lastLine, 0, lastLine, 0);
            const decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: "<-- Autocompleted code kept!",
                    margin: "10px",
                    color: "#00ff00",
                    fontStyle: "italic",
                },
                isWholeLine: true,
            });
            editor.setDecorations(decorationType, [{ range }]);
            setTimeout(() => editor.setDecorations(decorationType, []), 3000);
            await (0, saveEmbedding_1.saveEmbedding)({
                userId: context.globalState.get("userId") || (0, uuid_1.v4)(),
                sourceType: "autocomplete",
                sourceId: embedding_id,
                embedding: embedding,
            });
        }
        (0, tagSnippet_1.tagSnippet)(lastInsertedText, context.globalState.get("userId") || (0, uuid_1.v4)(), "autocomplete", editor.document.fileName, editor.document.languageId, editor.document.uri.fsPath);
        await supabase_1.supabase.from("autocompletes").insert({
            user_id: context.globalState.get("userId"),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            autocompleted_code: lastInsertedText,
            top_context_code: topContext,
            bottom_context_code: bottomContext,
            user_explanation: explanation,
            gemini_score: parsedFeedback.score,
            gemini_critique: parsedFeedback.critique,
            gemini_suggestion: parsedFeedback.suggestion,
            spectator_mode: false,
            deleted: parsedFeedback.score < 4,
            bypass: false,
        });
        lastInsertedText = null;
        lastInsertedPosition = null;
        lastDocUri = null;
    });
}
//# sourceMappingURL=tabDetection.js.map