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
exports.login = login;
const vscode = __importStar(require("vscode"));
const supabase_1 = require("../lib/supabase");
async function login(context) {
    if (context.globalState.get('loggedIn')) {
        vscode.window.showInformationMessage("You are already logged in.");
        return;
    }
    const output = vscode.window.createOutputChannel("VibeCheck");
    output.show(true);
    const email = await vscode.window.showInputBox({
        placeHolder: "Login to VibeCheck",
        prompt: "Enter your email that you used to sign up for VibeCheck",
        ignoreFocusOut: true
    });
    const password = await vscode.window.showInputBox({
        placeHolder: "Login to VibeCheck",
        prompt: "Enter your password that you used to sign up for VibeCheck",
        password: true,
        ignoreFocusOut: true
    });
    const apiKey = await vscode.window.showInputBox({
        placeHolder: "Login to VibeCheck",
        prompt: "Enter your API key that you received after signing up for VibeCheck",
        ignoreFocusOut: true
    });
    if (!email || !password || !apiKey) {
        vscode.window.showErrorMessage("Login cancelled. Please try again.");
        return;
    }
    const { data: authData, error: authError } = await supabase_1.supabase.auth.signInWithPassword({
        email,
        password
    });
    if (authError || !authData) {
        vscode.window.showErrorMessage(`Login failed. ${authError?.message}`);
        return;
    }
    const { data: userRows, error: userFetchError } = await supabase_1.supabase
        .from('users')
        .select('api_key, full_name, id')
        .eq('email', email)
        .single();
    if (userFetchError || !userRows) {
        vscode.window.showErrorMessage(`User fetch failed: ${userFetchError.message}`);
        return;
    }
    if (userRows.api_key !== apiKey) {
        vscode.window.showErrorMessage("Invalid API key. Please check your credentials.");
        return;
    }
    const { error: updateError } = await supabase_1.supabase
        .from('users')
        .update({ extension_connected: true })
        .eq('email', email);
    if (updateError) {
        vscode.window.showErrorMessage(`Failed to update user: ${updateError.message}`);
        return;
    }
    await context.globalState.update('email', email);
    await context.globalState.update('apiKey', apiKey);
    await context.globalState.update('name', userRows.full_name);
    await context.globalState.update('userId', userRows.id);
    await context.globalState.update('loggedIn', true);
    vscode.window.showInformationMessage(`Welcome, ${userRows.full_name}! You are now logged in to VibeCheck.`);
    output.appendLine(`User ${userRows.full_name} logged in successfully.`);
}
//# sourceMappingURL=login.js.map