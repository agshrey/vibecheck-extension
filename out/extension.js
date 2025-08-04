"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const inlinePasteDetection_1 = require("./commands/inlinePasteDetection");
const logout_1 = require("./commands/logout");
const login_1 = require("./commands/login");
const spectatorMode_1 = require("./commands/spectatorMode");
const tabDetection_1 = require("./commands/tabDetection");
const currentTime_1 = require("./commands/currentTime");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('toolbox.currentTime', currentTime_1.currentTime), vscode.commands.registerCommand('toolbox.login', () => (0, login_1.login)(context)), vscode.commands.registerCommand('toolbox.logout', () => (0, logout_1.logout)(context)), vscode.commands.registerCommand('toolbox.inlinePasteDetection', () => (0, inlinePasteDetection_1.inlinePasteDetection)(context)), vscode.commands.registerCommand('toolbox.spectatorMode', () => (0, spectatorMode_1.spectatorMode)(context)), vscode.commands.registerCommand('toolbox.tabDetection', () => (0, tabDetection_1.registerTabDetection)(context)));
    const output = vscode.window.createOutputChannel("VibeCheck");
    output.show(true);
    output.appendLine(`
_    ___ __         ________              __  
| |  / (_) /_  ___  / ____/ /_  ___  _____/ /__
| | / / / __ \\/ _ \\/ /   / __ \\/ _ \\/ ___/ //_/
| |/ / / /_/ /  __/ /___/ / / /  __/ /__/ ,<   
|___/_/_.___/\\___/\\____/_/ /_/\\___/\\___/_/|_|
	`);
    const loggedIn = context.globalState.get('loggedIn');
    if (!loggedIn) {
        await (0, login_1.login)(context);
    }
    else {
        const storedEmail = context.globalState.get('email');
        const storedName = context.globalState.get('name');
        const storedUserId = context.globalState.get('userId');
        const storedApiKey = context.globalState.get('apiKey');
        if (storedEmail && storedName && storedUserId && storedApiKey) {
            vscode.window.showInformationMessage(`Welcome back, ${storedName}! You are logged in as ${storedEmail}.`);
            (0, tabDetection_1.registerTabDetection)(context);
        }
        else {
            vscode.window.showErrorMessage("You are logged in, but your user data is incomplete. Please log out and log back in.");
            await (0, logout_1.logout)(context);
        }
    }
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map