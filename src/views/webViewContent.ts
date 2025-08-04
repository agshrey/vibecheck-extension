export function getWebviewContent(): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        margin: 0;
        padding: 2em;
        max-width: 800px;
      }

      h2 {
        margin-bottom: 0.5em;
        color: #007acc;
      }

      .code-preview pre {
        background-color: #f0f0f0;
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
        font-family: monospace;
        font-size: 13px;
        white-space: pre-wrap;
        margin-bottom: 1em;
        border-left: 4px solid #007acc;
      }

      .highlight {
        background-color: rgba(144, 238, 144, 0.3);
      }

      textarea {
        width: 100%;
        height: 120px;
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 6px;
        resize: vertical;
        background-color: #fff;
      }

      button {
        margin-top: 1em;
        padding: 10px 16px;
        font-size: 14px;
        background-color: #007acc;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      button:hover {
        background-color: #005fa3;
      }

      .loader {
        margin: 1.5em auto;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #007acc;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        display: none;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .feedback {
        margin-top: 2em;
        padding: 1.5em;
        border-radius: 6px;
        background: #eef6fb;
        border-left: 4px solid #007acc;
        display: none;
      }

      .score-bar {
        margin-top: 1em;
        background: #ddd;
        border-radius: 6px;
        overflow: hidden;
        height: 20px;
      }

      .score-bar-inner {
        background: #4caf50;
        height: 100%;
        width: 0%;
        text-align: center;
        color: white;
        font-size: 12px;
        line-height: 20px;
      }

      .critique, .suggestion {
        margin-top: 1em;
      }

      .critique strong, .suggestion strong {
        display: block;
        margin-bottom: 0.5em;
        color: #005fa3;
      }
    </style>
  </head>
  <body>
    <h2>🧠 Explain the code you're pasting</h2>

    <div id="code-preview" class="code-preview" style="display: none;"></div>

    <textarea id="explanation" placeholder="E.g., This function fetches data from an API and displays it..."></textarea><br>
    <button onclick="submit()">Submit Reflection</button>

    <div class="loader" id="loader"></div>
    <div class="feedback" id="feedback"></div>

    <script>
      const vscode = acquireVsCodeApi();

      function escapeHTML(text) {
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
      }

      function submit() {
        const explanation = document.getElementById('explanation').value;
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('loader').style.display = 'block';
        vscode.postMessage({ type: 'submit', explanation });
      }

      window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'init') {
          const codePreview = document.getElementById('code-preview');
          const contextLines = message.fileContext.split('\\n');
          const pasteLines = message.pastedCode.split('\\n').map(line => line.trim());

          const escapedLines = contextLines.map(line => {
            const trimmed = line.trim();
            const shouldHighlight = pasteLines.some(pasteLine =>
              pasteLine.length > 0 && trimmed.includes(pasteLine)
            );
            return shouldHighlight
              ? '<span class="highlight">' + escapeHTML(line) + '</span>'
              : escapeHTML(line);
          });

          codePreview.innerHTML = '<pre>' + escapedLines.join('\\n') + '</pre>';
          codePreview.style.display = 'block';
        }

        if (message.type === 'feedback') {
          document.getElementById('loader').style.display = 'none';
          const feedbackContainer = document.getElementById('feedback');
          feedbackContainer.style.display = 'block';

          try {
            const parsed = JSON.parse(message.feedback);
            const score = Math.round(parsed.score ?? 0);
            feedbackContainer.innerHTML = \`
              <div class="score-bar">
                <div class="score-bar-inner" style="width: \${score}%;">\${score}% Accurate</div>
              </div>
              <div class="critique">
                <strong>💬 Critique</strong>
                <div>\${parsed.critique}</div>
              </div>
              <div class="suggestion">
                <strong>💡 Suggestion</strong>
                <div>\${parsed.suggestion}</div>
              </div>
            \`;
          } catch (e) {
            feedbackContainer.innerHTML = \`
              <h3>Gemini Feedback</h3>
              <pre style="white-space: pre-wrap;">\${message.feedback}</pre>
            \`;
          }
        }
      });
    </script>
  </body>
  </html>
  `;
}