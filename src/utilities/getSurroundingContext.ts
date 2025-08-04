import * as vscode from 'vscode';

export function getSurroundingContext(
  document: vscode.TextDocument,
  position: vscode.Position,
  numLines: number = 5
): { topContext: string; bottomContext: string; } {
  const totalLines = document.lineCount;
  const startLine = Math.max(0, position.line - numLines);
  const endLine = Math.min(totalLines - 1, position.line + numLines);

  const topLines: string[] = [];
  const bottomLines: string[] = [];

  for (let i = startLine; i < position.line; i++) {
    topLines.push(document.lineAt(i).text);
  }

  for (let i = position.line + 1; i <= endLine; i++) {
    bottomLines.push(document.lineAt(i).text);
  }

  return {
    topContext: topLines.join('\n'),
    bottomContext: bottomLines.join('\n')
  };
}
