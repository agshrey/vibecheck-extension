import * as vscode from 'vscode';
import { getGeminiFeedback } from '../api/pasteGemini';
import { getWebviewContent } from '../views/webViewContent';
import { v4 as uuidv4 } from 'uuid';

export async function pasteDetection() {
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

    const fileContext = Array.from({ length: end - start + 1 }, (_, i) =>
      document.lineAt(start + i).text).join('\n');

    // Step 2: Grab a block of lines that *likely* include the paste
    const pastedLines = Array.from({ length: 10 }, (_, i) => {
      const lineNum = cursorLine + i;
      if (lineNum < totalLines) {
        return document.lineAt(lineNum).text;
      }
      return '';
    }).join('\n');

    // Open the webview
    const panel = vscode.window.createWebviewPanel(
      'geminiFeedback',
      'Reflect on Paste',
      vscode.ViewColumn.Active,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

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

        const feedback = await getGeminiFeedback(
          pastedLines,
          userExplanation,
          fileName,
          language,
          message.topContext,
          message.bottomContext
        );

        panel.webview.postMessage({
          type: "feedback",
          feedback
        });

        // Don't re-insert — it's already in the file now
      }
    });
  }, 150); // wait for the paste to finish
}
