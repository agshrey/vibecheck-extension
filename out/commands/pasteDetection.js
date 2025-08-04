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
exports.pasteDetection = pasteDetection;
const vscode = __importStar(require("vscode"));
const pasteGemini_1 = require("../api/pasteGemini");
const webViewContent_1 = require("../views/webViewContent");
async function pasteDetection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("No active text editor.");
        return;
    }
    const document = editor.document;
    const language = document.languageId;
    const fileName = document.fileName;
    const cursorLine = editor.selection.active.line;
    // Step 1: Delay to let the paste happen
    setTimeout(async () => {
        const totalLines = document.lineCount;
        const start = Math.max(0, cursorLine - 20);
        const end = Math.min(totalLines - 1, cursorLine + 20);
        const fileContext = Array.from({ length: end - start + 1 }, (_, i) => document.lineAt(start + i).text).join('\n');
        // Step 2: Grab a block of lines that *likely* include the paste
        const pastedLines = Array.from({ length: 10 }, (_, i) => {
            const lineNum = cursorLine + i;
            if (lineNum < totalLines) {
                return document.lineAt(lineNum).text;
            }
            return '';
        }).join('\n');
        // Open the webview
        const panel = vscode.window.createWebviewPanel('geminiFeedback', 'Reflect on Paste', vscode.ViewColumn.Active, { enableScripts: true });
        panel.webview.html = (0, webViewContent_1.getWebviewContent)();
        // Send init message with updated info
        panel.webview.postMessage({
            type: "init",
            fileContext,
            pastedCode: pastedLines
        });
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.type === "submit") {
                const userExplanation = message.explanation?.trim();
                if (!userExplanation) {
                    vscode.window.showWarningMessage("Please provide an explanation before submitting.");
                    return;
                }
                const feedback = await (0, pasteGemini_1.getGeminiFeedback)(pastedLines, userExplanation, fileName, language, message.topContext, message.bottomContext);
                panel.webview.postMessage({
                    type: "feedback",
                    feedback
                });
                // Don't re-insert — it's already in the file now
            }
        });
    }, 150); // wait for the paste to finish
}
//# sourceMappingURL=pasteDetection.js.map