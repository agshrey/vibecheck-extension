import * as vscode from 'vscode';
import { supabase } from '../lib/supabase';

export async function logout(context: vscode.ExtensionContext) {
	const storedEmail = context.globalState.get<string>('email');

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

	const { error: updateError } = await supabase
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