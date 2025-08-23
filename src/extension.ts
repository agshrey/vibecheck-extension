// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { inlinePasteDetection } from "./commands/inlinePasteDetection";
import { logout } from "./commands/logout";
import { login } from "./commands/login";
import { spectatorMode } from "./commands/spectatorMode";
import { registerTabDetection } from "./commands/tabDetection";
import { currentTime } from "./commands/currentTime";
require("dotenv").config();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log(process.env.GEMINI_API_KEY);

  context.subscriptions.push(
    vscode.commands.registerCommand("toolbox.currentTime", currentTime),
    vscode.commands.registerCommand("toolbox.login", () => login(context)),
    vscode.commands.registerCommand("toolbox.logout", () => logout(context)),
    vscode.commands.registerCommand("toolbox.inlinePasteDetection", () =>
      inlinePasteDetection(context)
    ),
    vscode.commands.registerCommand("toolbox.spectatorMode", () =>
      spectatorMode(context)
    ),
    vscode.commands.registerCommand("toolbox.tabDetection", () =>
      registerTabDetection(context)
    )
  );

  const output = vscode.window.createOutputChannel("VibeCheck");
  output.show(true);
  output.appendLine(`
_    ___ __         ________              __  
| |  / (_) /_  ___  / ____/ /_  ___  _____/ /__
| | / / / __ \\/ _ \\/ /   / __ \\/ _ \\/ ___/ //_/
| |/ / / /_/ /  __/ /___/ / / /  __/ /__/ ,<   
|___/_/_.___/\\___/\\____/_/ /_/\\___/\\___/_/|_|
	`);

  const loggedIn = context.globalState.get<boolean>("loggedIn");
  if (!loggedIn) {
    await login(context);
  } else {
    const storedEmail = context.globalState.get<string>("email");
    const storedName = context.globalState.get<string>("name");
    const storedUserId = context.globalState.get<string>("userId");
    const storedApiKey = context.globalState.get<string>("apiKey");
    if (storedEmail && storedName && storedUserId && storedApiKey) {
      vscode.window.showInformationMessage(
        `Welcome back, ${storedName}! You are logged in as ${storedEmail}.`
      );
      registerTabDetection(context);
    } else {
      vscode.window.showErrorMessage(
        "You are logged in, but your user data is incomplete. Please log out and log back in."
      );
      await logout(context);
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
