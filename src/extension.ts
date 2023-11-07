import * as vscode from "vscode";
import { createCodeSnippet } from "./createCodeSnippet";
import { updatePrefixSymbol } from "./updatePrefixSymbol";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.workspaceCodeSnippet",
    createCodeSnippet
  );

  context.subscriptions.push(disposable);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("prefixSymbol")) {
      // Update the snippets
      updatePrefixSymbol();
    }
  });
}
