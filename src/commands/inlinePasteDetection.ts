import * as vscode from "vscode";
import { getGeminiFeedback } from '../api/pasteGemini';
import { getAsciiProgressBar } from '../utilities/getAsciiProgressBar';
import { supabase } from '../lib/supabase';
import { getSurroundingContext } from "../utilities/getSurroundingContext";
import { getEmbedding } from "../lib/getEmbedding";
import { saveEmbedding } from "../lib/saveEmbedding";
import { v4 as uuidv4 } from 'uuid';
import { findSimilarEmbeddng } from "../utilities/findSimilarEmbedding";

export async function inlinePasteDetection(context: vscode.ExtensionContext) {

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    
    const position = editor.selection.active;
    const lineNumber = position.line;

    const range = new vscode.Range(lineNumber, 0, lineNumber, 0);

    const clipboardText = await vscode.env.clipboard.readText();

    //not logged in, just paste
    if (context.globalState.get<boolean>('loggedIn') !== true) {
        editor.edit(editBuilder => {
            editBuilder.insert(position, clipboardText);
        });
        return;
    }

    if (!clipboardText) {
        vscode.window.showWarningMessage("Clipboard is empty.");
        return;
    }

    const contextRadius = 5; // Number of lines before and after
    const { topContext, bottomContext } = getSurroundingContext(editor.document, position, contextRadius);

    const embedding = await getEmbedding(clipboardText);
    if (!embedding) {
        vscode.window.showErrorMessage("Failed to generate embedding for the pasted code.");
        return;
    }

    const embedding_id = uuidv4();

    //spectator mode bypass
    if (context.globalState.get<boolean>('spectatorModeEnabled')) {
        editor.edit(editBuilder => {
            editBuilder.insert(position, clipboardText);
        });

        await saveEmbedding({
            userId: context.globalState.get<string>('userId') || uuidv4(),
            sourceType: "paste",
            sourceId: embedding_id,
            embedding: embedding
        });

        await supabase.from('pastes').insert({
            id: embedding_id,
            user_id: context.globalState.get<string>('userId'),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            pasted_code: clipboardText,
            top_context_code : topContext,
            bottom_context_code: bottomContext,
            user_explanation: "",
            gemini_score: 0,
            gemini_critique: "",
            gemini_suggestion: "",
            spectator_mode: true,
            bypassed: false
        });
        return;
    }

    // similar code bypass
    if (await findSimilarEmbeddng(embedding, context.globalState.get<string>('userId') || uuidv4())) {

        let decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: "<-- Similar code detected! bypassed explanation.",
                margin: '10px',
                color: '#ffa200ff',
                fontStyle: 'italic',
            },
            isWholeLine: true
        });

        editor.setDecorations(decoration, [{range}]);

        editor.edit(editBuilder => {
            editBuilder.insert(position, clipboardText);
        });

        setTimeout(() => {
            editor.setDecorations(decoration, []);
        }, 3000);

        await saveEmbedding({
            userId: context.globalState.get<string>('userId') || uuidv4(),
            sourceType: "paste",
            sourceId: embedding_id,
            embedding: embedding
        });

        await supabase.from('pastes').insert({
            id: embedding_id,
            user_id: context.globalState.get<string>('userId'),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            pasted_code: clipboardText,
            top_context_code : topContext,
            bottom_context_code: bottomContext,
            user_explanation: "",
            gemini_score: 0,
            gemini_critique: "",
            gemini_suggestion: "",
            spectator_mode: false,
            bypassed: true
        });


        return;
    }

    //regular explanation flow
    let input: string | undefined;

    let decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: "<-- Copied code detected!",
        margin: '10px',
        color: '#ff0000',
        fontStyle: 'italic',
      },
      isWholeLine: true
    });

    editor.setDecorations(decorationType, [{ range }]);

    let shouldPaste = false;
    let scoreEmoji = "";
    let parsedFeedback: any = null;

    do {
        input = await vscode.window.showInputBox({ prompt: 'Explain the code.' });

        if (!input) {
            vscode.window.showErrorMessage(`Paste cancelled.`);
            break;
        }

        const feedback = await getGeminiFeedback(
            clipboardText,
            input,
            editor.document.fileName,
            editor.document.languageId,
            topContext,
            bottomContext
        );

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
            output.appendLine(`Score: ${getAsciiProgressBar(parsedFeedback.score)}`);
            output.appendLine(``);
            output.appendLine(`Critique: ${parsedFeedback.critique}`);
            output.appendLine(``);
            output.appendLine(`Suggestion: ${parsedFeedback.suggestion}`);

            if (parsedFeedback.score >= 7) {
                shouldPaste = true;
                break;
            } else {
                const choices = ["Retry", "Cancel"];
                const selection = await vscode.window.showQuickPick(choices, {
                    placeHolder: "Would you like to retry or cancel?"
                });
                if (selection === "Cancel") {

                        await saveEmbedding({
                        userId: context.globalState.get<string>('userId') || uuidv4(),
                        sourceType: "paste",
                        sourceId: embedding_id,
                        embedding: embedding
                        });

                        await supabase.from('pastes').insert({
                        id: embedding_id,
                        user_id: context.globalState.get<string>('userId'),
                        filename: editor.document.fileName,
                        filepath: editor.document.uri.fsPath,
                        language: editor.document.languageId,
                        pasted_code: clipboardText,
                        top_context_code : topContext,
                        bottom_context_code: bottomContext,
                        user_explanation: input,
                        gemini_score: parsedFeedback.score,
                        gemini_critique: parsedFeedback.critique,
                        gemini_suggestion: parsedFeedback.suggestion,
                        spectator_mode: false,
                        bypassed: false
                    });
                    vscode.window.showErrorMessage("Paste cancelled.");
                    break;
                }
            }
        } catch {
            vscode.window.showWarningMessage("Could not parse Gemini response.");
            break;
        }
    } while (!shouldPaste);

    if (shouldPaste) {

        editor.setDecorations(decorationType, []);

        editor.edit(editBuilder => {
            editBuilder.insert(position, clipboardText);
        });

        decorationType = vscode.window.createTextEditorDecorationType({
          after: {
            contentText: "<-- Pasted successfully!",
            margin: '10px',
            color: '#00ff00',
            fontStyle: 'italic',
          },
          isWholeLine: true
        });
        
        editor.setDecorations(decorationType, [{ range }]);

        await saveEmbedding({
            userId: context.globalState.get<string>('userId') || uuidv4(),
            sourceType: "paste",
            sourceId: embedding_id,
            embedding: embedding
        });

        await supabase.from('pastes').insert({
            id: embedding_id,
            user_id: context.globalState.get<string>('userId'),
            filename: editor.document.fileName,
            filepath: editor.document.uri.fsPath,
            language: editor.document.languageId,
            pasted_code: clipboardText,
            top_context_code : topContext,
            bottom_context_code: bottomContext,
            user_explanation: input,
            gemini_score: parsedFeedback.score,
            gemini_critique: parsedFeedback.critique,
            gemini_suggestion: parsedFeedback.suggestion,
            spectator_mode: false,  
            bypassed: false
        });

    }

    setTimeout(() => {
      editor.setDecorations(decorationType, []);
    }, 3000);
}