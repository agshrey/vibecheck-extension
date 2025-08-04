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
exports.logout = logout;
const vscode = __importStar(require("vscode"));
const supabase_1 = require("../lib/supabase");
async function logout(context) {
    const storedEmail = context.globalState.get('email');
    if (!storedEmail) {
        vscode.window.showErrorMessage("You are not logged in. Please log in first.");
        return;
    }
    const confirm = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Are you sure you want to log out?",
    });
    if (confirm !== "Yes") {
        vscode.window.showInformationMessage("Logout cancelled.");
        return;
    }
    const { error: updateError } = await supabase_1.supabase
        .from('users')
        .update({ extension_connected: false })
        .eq('email', storedEmail);
    if (updateError) {
        vscode.window.showErrorMessage(`Logout failed: ${updateError.message}`);
        return;
    }
    await context.globalState.update('email', undefined);
    await context.globalState.update('apiKey', undefined);
    await context.globalState.update('name', undefined);
    await context.globalState.update('userId', undefined);
    await context.globalState.update('loggedIn', false);
    vscode.window.showInformationMessage('You have successfully logged out of VibeCheck.');
    const reload = await vscode.window.showQuickPick(['Reload', 'Cancel'], {
        placeHolder: 'Would you like to reload VS Code now?'
    });
    if (reload === 'Reload') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}
//# sourceMappingURL=logout.js.map