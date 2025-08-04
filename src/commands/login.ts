import * as vscode from 'vscode';
import { supabase } from '../lib/supabase';

export async function login(context: vscode.ExtensionContext) {
    if (context.globalState.get<boolean>('loggedIn')) {
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

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError || !authData) {
        vscode.window.showErrorMessage(`Login failed. ${authError?.message}`);
        return;
    }

    const { data: userRows, error: userFetchError } = await supabase
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

    const { error : updateError } = await supabase
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