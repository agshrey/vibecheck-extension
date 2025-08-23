import fetch from "node-fetch";
require("dotenv").config();

export async function getGeminiFeedback(
  code: string,
  explanation: string,
  fileName: string | undefined,
  language: string | undefined,
  topContext: string,
  bottomContext: string
): Promise<string> {
  const prompt = `
    You are an expert code reviewer. Your task is to evaluate a piece of code that was pasted into a file in VS Code.
    The user has provided an explanation of the code they pasted. Your job is to analyze the code, the explanation, and the surrounding context to provide feedback.
    Write your response in first person, as if you are speaking directly to the user.

    Below is a code snippet that a user is attempting to paste into a file. You are given:
        - The name and type of the file ("${fileName}")
        - The programming language ("${language}")
        - The code above the pasted code ("${topContext}")
        - The code below the pasted code ("${bottomContext}")
        - The user’s code snippet ("${code}")
        - The user’s explanation of what they think the code does ("${explanation}")

    Please do the following:
        1. **Assess whether the user’s explanation accurately describes what the code does.**
        2. **Score their explanation out of 10**, based on clarity, accuracy, and completeness.
        3. **Provide constructive feedback** on the code snippet itself, considering the surrounding context.
        4. **Suggest improvements** if the code has stylistic, logical, or structural issues.

    This response is going to show up in a VS Code extension, so don't make the explanation too long.
    
    Respond with a JSON object in the following format:
    """json
        {
        "score": 0–10,
        "critique": "Your critique of the explanation and the code goes here.",
        "suggestion": "Specific suggestions to improve the code or understanding."
        }
    """json
    `;

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await response.json();
  let output =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback received";

  output = output.trim().replace(/^```json\s|```$/g, "");

  try {
    JSON.parse(output);
    return output;
  } catch {
    return JSON.stringify({
      score: 0,
      critique: "Could not parse Gemini response.",
      suggestion: "Try again or rephrase your explanation.",
    });
  }
}
