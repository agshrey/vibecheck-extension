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
exports.inlinePasteDetection = inlinePasteDetection;
const vscode = __importStar(require("vscode"));
const pasteGemini_1 = require("../api/pasteGemini");
const getAsciiProgressBar_1 = require("../utilities/getAsciiProgressBar");
const supabase_1 = require("../lib/supabase");
const getSurroundingContext_1 = require("../utilities/getSurroundingContext");
const getEmbedding_1 = require("../lib/getEmbedding");
const saveEmbedding_1 = require("../lib/saveEmbedding");
const uuid_1 = require("uuid");
const findSimilarEmbedding_1 = require("../utilities/findSimilarEmbedding");
const tagSnippet_1 = require("../lib/tagSnippet");
async function inlinePasteDetection(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const position = editor.selection.active;
    const lineNumber = position.line;
    const range = new vscode.Range(lineNumber, 0, lineNumber, 0);
    const clipboardText = await vscode.env.clipboard.readText();
    //not logged in, just paste
    if (context.globalState.get("loggedIn") !== true) {
        editor.edit((editBuilder) => {
            editBuilder.insert(position, clipboardText);
        });
        return;
    }
    if (!clipboardText) {
        vscode.window.showWarningMessage("Clipboard is empty.");
        return;
    }
    const contextRadius = 5; // Number of lines before and after
    const { topContext, bottomContext } = (0, getSurroundingContext_1.getSurroundingContext)(editor.document, position, contextRadius);
    const embedding = await (0, getEmbedding_1.getEmbedding)(clipboardText);
    if (!embedding) {
        vscode.window.showErrorMessage("Failed to generate embedding for the pasted code.");
        return;
    }
    const embedding_id = (0, uuid_1.v4)();
    //spectator mode bypass
    if (context.globalState.get("spectatorModeEnabled")) {
        editor.edit((editBuilder) => {
            editBuilder.insert(position, clipboardText);
        });
        await (0, saveEmbedding_1.saveEmbedding)({
            userId: context.globalState.get("userId") || (0, uuid_1.v4)(),
            sourceType: "paste",
            sourceId: embedding_id,
            embedding: embedding,
        });
        await supabase_1.supabase.from("pastes").insert({
            id: embedding_id,
            user_id: context.globalState.get("userId"),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            pasted_code: clipboardText,
            top_context_code: topContext,
            bottom_context_code: bottomContext,
            user_explanation: "",
            gemini_score: 0,
            gemini_critique: "",
            gemini_suggestion: "",
            spectator_mode: true,
            bypassed: false,
        });
        return;
    }
    // similar code bypass
    if (await (0, findSimilarEmbedding_1.findSimilarEmbeddng)(embedding, context.globalState.get("userId") || (0, uuid_1.v4)())) {
        let decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: "<-- Similar code detected! bypassed explanation.",
                margin: "10px",
                color: "#ffa200ff",
                fontStyle: "italic",
            },
            isWholeLine: true,
        });
        editor.setDecorations(decoration, [{ range }]);
        editor.edit((editBuilder) => {
            editBuilder.insert(position, clipboardText);
        });
        setTimeout(() => {
            editor.setDecorations(decoration, []);
        }, 3000);
        await (0, saveEmbedding_1.saveEmbedding)({
            userId: context.globalState.get("userId") || (0, uuid_1.v4)(),
            sourceType: "paste",
            sourceId: embedding_id,
            embedding: embedding,
        });
        await supabase_1.supabase.from("pastes").insert({
            id: embedding_id,
            user_id: context.globalState.get("userId"),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            pasted_code: clipboardText,
            top_context_code: topContext,
            bottom_context_code: bottomContext,
            user_explanation: "",
            gemini_score: 0,
            gemini_critique: "",
            gemini_suggestion: "",
            spectator_mode: false,
            bypassed: true,
        });
        return;
    }
    //regular explanation flow
    let input;
    let decorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: "<-- Copied code detected!",
            margin: "10px",
            color: "#ff0000",
            fontStyle: "italic",
        },
        isWholeLine: true,
    });
    editor.setDecorations(decorationType, [{ range }]);
    let shouldPaste = false;
    let scoreEmoji = "";
    let parsedFeedback = null;
    do {
        input = await vscode.window.showInputBox({ prompt: "Explain the code." });
        if (!input) {
            vscode.window.showErrorMessage(`Paste cancelled.`);
            break;
        }
        const feedback = await (0, pasteGemini_1.getGeminiFeedback)(clipboardText, input, editor.document.fileName, editor.document.languageId, topContext, bottomContext);
        try {
            parsedFeedback = JSON.parse(feedback);
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
            output.appendLine("🌟 Vibe Check Feedback");
            output.appendLine(``);
            output.appendLine(scoreEmoji);
            output.appendLine(``);
            output.appendLine(`Score: ${(0, getAsciiProgressBar_1.getAsciiProgressBar)(parsedFeedback.score)}`);
            output.appendLine(``);
            output.appendLine(`Critique: ${parsedFeedback.critique}`);
            output.appendLine(``);
            output.appendLine(`Suggestion: ${parsedFeedback.suggestion}`);
            if (parsedFeedback.score >= 7) {
                shouldPaste = true;
                break;
            }
            else {
                const choices = ["Retry", "Cancel"];
                const selection = await vscode.window.showQuickPick(choices, {
                    placeHolder: "Would you like to retry or cancel?",
                });
                if (selection === "Cancel") {
                    await (0, saveEmbedding_1.saveEmbedding)({
                        userId: context.globalState.get("userId") || (0, uuid_1.v4)(),
                        sourceType: "paste",
                        sourceId: embedding_id,
                        embedding: embedding,
                    });
                    (0, tagSnippet_1.tagSnippet)(clipboardText, context.globalState.get("userId") || (0, uuid_1.v4)(), "paste", editor.document.fileName, editor.document.languageId, editor.document.uri.fsPath);
                    await supabase_1.supabase.from("pastes").insert({
                        id: embedding_id,
                        user_id: context.globalState.get("userId"),
                        filename: editor.document.fileName,
                        filepath: editor.document.uri.fsPath,
                        language: editor.document.languageId,
                        pasted_code: clipboardText,
                        top_context_code: topContext,
                        bottom_context_code: bottomContext,
                        user_explanation: input,
                        gemini_score: parsedFeedback.score,
                        gemini_critique: parsedFeedback.critique,
                        gemini_suggestion: parsedFeedback.suggestion,
                        spectator_mode: false,
                        bypassed: false,
                    });
                    vscode.window.showErrorMessage("Paste cancelled.");
                    break;
                }
            }
        }
        catch {
            vscode.window.showWarningMessage("Could not parse Gemini response.");
            break;
        }
    } while (!shouldPaste);
    if (shouldPaste) {
        editor.setDecorations(decorationType, []);
        editor.edit((editBuilder) => {
            editBuilder.insert(position, clipboardText);
        });
        decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: "<-- Pasted successfully!",
                margin: "10px",
                color: "#00ff00",
                fontStyle: "italic",
            },
            isWholeLine: true,
        });
        editor.setDecorations(decorationType, [{ range }]);
        await (0, saveEmbedding_1.saveEmbedding)({
            userId: context.globalState.get("userId") || (0, uuid_1.v4)(),
            sourceType: "paste",
            sourceId: embedding_id,
            embedding: embedding,
        });
        console.log("before tag snippet");
        (0, tagSnippet_1.tagSnippet)(clipboardText, context.globalState.get("userId") || (0, uuid_1.v4)(), "paste", editor.document.fileName, editor.document.languageId, editor.document.uri.fsPath);
        console.log("after tag snippet");
        await supabase_1.supabase.from("pastes").insert({
            id: embedding_id,
            user_id: context.globalState.get("userId"),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            pasted_code: clipboardText,
            top_context_code: topContext,
            bottom_context_code: bottomContext,
            user_explanation: input,
            gemini_score: parsedFeedback.score,
            gemini_critique: parsedFeedback.critique,
            gemini_suggestion: parsedFeedback.suggestion,
            spectator_mode: false,
            bypassed: false,
        });
    }
    setTimeout(() => {
        editor.setDecorations(decorationType, []);
    }, 3000);
}
//# sourceMappingURL=inlinePasteDetection.js.map