import * as vscode from 'vscode';

export async function spectatorMode(context: vscode.ExtensionContext) {
    if (context.globalState.get<boolean>('loggedIn') !== true) {
        vscode.window.showErrorMessage("You must be logged in to turn on Spectator Mode.");
        return;
    }

    const spectatorModeEnabled = context.globalState.get<boolean>('spectatorModeEnabled', false);
    if (spectatorModeEnabled) {
        context.globalState.update('spectatorModeEnabled', false);
        vscode.window.showInformationMessage("Spectator Mode has been disabled.");
    } else {
        context.globalState.update('spectatorModeEnabled', true);
        vscode.window.showInformationMessage("Spectator Mode has been enabled.");
    }
}