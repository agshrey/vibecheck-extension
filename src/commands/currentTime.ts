import * as vscode from 'vscode';
import { getEmbedding } from '../lib/getEmbedding';

export async function currentTime() {
    const embedding = await getEmbedding("console.log('Hello, World!');");
    
    
    if (embedding) {
        const preview = embedding.slice(0,384).map(num => num.toFixed(4)).join(', ');
        vscode.window.showInformationMessage(preview);
    } else {
        vscode.window.showInformationMessage('Embedding is null.');
    }
}