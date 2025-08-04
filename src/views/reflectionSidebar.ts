import * as vscode from 'vscode';
import { getWebviewContent } from './webViewContent';

export class ReflectionsSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'reflectionSidebar';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = getWebviewContent();

    // You can also handle messages here
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'submit') {
        vscode.window.showInformationMessage(`Got explanation: ${msg.explanation}`);
      }
    });
  }

  public updateContent(fileContext: string, pastedCode: string) {
    this._view?.webview?.postMessage({
      type: 'init',
      fileContext,
      pastedCode
    });
  }

  public reveal() {
    vscode.commands.executeCommand('workbench.view.explorer'); // Makes sure the Explorer is active
    vscode.commands.executeCommand('vscode.openWith', vscode.Uri.parse(`vscode://vscode.git/`), ReflectionsSidebarProvider.viewType);
  }
}