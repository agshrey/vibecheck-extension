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
exports.ReflectionsSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const webViewContent_1 = require("./webViewContent");
class ReflectionsSidebarProvider {
    _extensionUri;
    static viewType = 'reflectionSidebar';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = (0, webViewContent_1.getWebviewContent)();
        // You can also handle messages here
        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === 'submit') {
                vscode.window.showInformationMessage(`Got explanation: ${msg.explanation}`);
            }
        });
    }
    updateContent(fileContext, pastedCode) {
        this._view?.webview?.postMessage({
            type: 'init',
            fileContext,
            pastedCode
        });
    }
    reveal() {
        vscode.commands.executeCommand('workbench.view.explorer'); // Makes sure the Explorer is active
        vscode.commands.executeCommand('vscode.openWith', vscode.Uri.parse(`vscode://vscode.git/`), ReflectionsSidebarProvider.viewType);
    }
}
exports.ReflectionsSidebarProvider = ReflectionsSidebarProvider;
//# sourceMappingURL=reflectionSidebar.js.map