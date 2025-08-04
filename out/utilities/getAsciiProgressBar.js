"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsciiProgressBar = getAsciiProgressBar;
function getAsciiProgressBar(score, max = 10) {
    const totalBars = 10;
    const filledBars = Math.round((score / max) * totalBars);
    const emptyBars = totalBars - filledBars;
    const filled = '█'.repeat(filledBars);
    const empty = '░'.repeat(emptyBars);
    return `[${filled}${empty}] ${score}/${max}`;
}
//# sourceMappingURL=getAsciiProgressBar.js.map