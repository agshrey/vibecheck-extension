"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurroundingContext = getSurroundingContext;
function getSurroundingContext(document, position, numLines = 5) {
    const totalLines = document.lineCount;
    const startLine = Math.max(0, position.line - numLines);
    const endLine = Math.min(totalLines - 1, position.line + numLines);
    const topLines = [];
    const bottomLines = [];
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
//# sourceMappingURL=getSurroundingContext.js.map