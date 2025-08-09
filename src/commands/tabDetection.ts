import * as vscode from "vscode";
import { supabase } from "../lib/supabase";
import { getGeminiFeedback } from "../api/pasteGemini";
import { getSurroundingContext } from "../utilities/getSurroundingContext";
import { getAsciiProgressBar } from "../utilities/getAsciiProgressBar";
import { findSimilarEmbeddng } from "../utilities/findSimilarEmbedding";
import { getEmbedding } from "../lib/getEmbedding";
import { saveEmbedding } from "../lib/saveEmbedding";
import { v4 as uuidv4 } from "uuid";

let lastInsertedText: string | null = null;
let lastInsertedPosition: vscode.Position | null = null;
let lastDocUri: vscode.Uri | null = null;

export function registerTabDetection(context: vscode.ExtensionContext) {
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

    const { topContext, bottomContext } = getSurroundingContext(
      editor.document,
      lastInsertedPosition,
      5
    );

    if (context.globalState.get<boolean>("loggedIn") !== true) {
      return;
    }

    if (context.globalState.get<boolean>("spectatorModeEnabled")) {
      await supabase.from("autocompletes").insert({
        user_id: context.globalState.get<string>("userId"),
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

    const embedding = await getEmbedding(lastInsertedText);
    const embedding_id = uuidv4();

    if (!embedding) {
      vscode.window.showErrorMessage(
        "Failed to generate embedding for the autocompleted code."
      );
      return;
    }

    if (
      await findSimilarEmbeddng(
        embedding,
        context.globalState.get<string>("userId") || uuidv4()
      )
    ) {
      await saveEmbedding({
        userId: context.globalState.get<string>("userId") || uuidv4(),
        sourceType: "autocomplete",
        sourceId: embedding_id,
        embedding: embedding,
      });

      await supabase.from("autocompletes").insert({
        user_id: context.globalState.get<string>("userId"),
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

      const range = new vscode.Range(
        lastInsertedPosition.line,
        0,
        lastInsertedPosition.line,
        0
      );
      editor.setDecorations(decoration, [{ range }]);
      setTimeout(() => editor.setDecorations(decoration, []), 3000);

      return;
    }

    const explanation = await vscode.window.showInputBox({
      prompt: "Explain the autocompleted code:",
      placeHolder: "Enter your explanation here",
    });

    console.log("Explanation provided:", explanation);

    if (!explanation) {
      const insertedLines = lastInsertedText.split("\n");
      const endLine = lastInsertedPosition.line + insertedLines.length - 1;
      const endChar = insertedLines[insertedLines.length - 1].length;
      const deleteRange = new vscode.Range(
        lastInsertedPosition,
        new vscode.Position(endLine, endChar)
      );

      const edit = new vscode.WorkspaceEdit();
      edit.delete(editor.document.uri, deleteRange);
      await vscode.workspace.applyEdit(edit);

      const range = new vscode.Range(
        lastInsertedPosition.line,
        0,
        lastInsertedPosition.line,
        0
      );
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

    const feedback = await getGeminiFeedback(
      lastInsertedText,
      explanation,
      editor.document.fileName,
      editor.document.languageId,
      topContext,
      bottomContext
    );

    if (!feedback) {
      vscode.window.showErrorMessage("Failed to get feedback from Gemini.");
      return;
    }

    const parsedFeedback = JSON.parse(feedback);

    let scoreEmoji = "";
    if (parsedFeedback.score <= 3) {
      scoreEmoji = "🔴 Poor Explanation";
    } else if (parsedFeedback.score <= 7) {
      scoreEmoji = "🟡 Could be better";
    } else {
      scoreEmoji = "🟢 Good Job";
    }

    const output = vscode.window.createOutputChannel("VibeCheck Feedback");
    output.show(true);
    output.appendLine("🌟 Vibe Check Feedback\n");
    output.appendLine(scoreEmoji + "\n");
    output.appendLine(`Score: ${getAsciiProgressBar(parsedFeedback.score)}\n`);
    output.appendLine(`Critique: ${parsedFeedback.critique}\n`);
    output.appendLine(`Suggestion: ${parsedFeedback.suggestion}`);

    const insertedLines = lastInsertedText.split("\n");
    const endLine = lastInsertedPosition.line + insertedLines.length - 1;
    const endChar = insertedLines[insertedLines.length - 1].length;

    if (parsedFeedback.score < 4) {
      const deleteRange = new vscode.Range(
        lastInsertedPosition,
        new vscode.Position(endLine, endChar)
      );

      const edit = new vscode.WorkspaceEdit();
      edit.delete(editor.document.uri, deleteRange);
      await vscode.workspace.applyEdit(edit);

      const range = new vscode.Range(
        lastInsertedPosition.line,
        0,
        lastInsertedPosition.line,
        0
      );
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
    } else {
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
    }

    await saveEmbedding({
      userId: context.globalState.get<string>("userId") || uuidv4(),
      sourceType: "autocomplete",
      sourceId: embedding_id,
      embedding: embedding,
    });

    await supabase.from("autocompletes").insert({
      user_id: context.globalState.get<string>("userId"),
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
