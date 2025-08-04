export function getAsciiProgressBar(score: number, max = 10): string {
  const totalBars = 10;
  const filledBars = Math.round((score / max) * totalBars);
  const emptyBars = totalBars - filledBars;

  const filled = '█'.repeat(filledBars);
  const empty = '░'.repeat(emptyBars);

  return `[${filled}${empty}] ${score}/${max}`;
}
