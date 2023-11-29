import * as vscode from "vscode";
import { createCodeSnippet } from "./createCodeSnippet";
import { updatePrefixSymbol } from "./updatePrefixSymbol";

/**
 * Activates the extension and registers the `extension.workspaceCodeSnippet` command.
 * @param context The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.workspaceCodeSnippet",
    createCodeSnippet
  );

  context.subscriptions.push(disposable);

  // Update prefix symbol when configuration changes
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("workspaceCodeSnippets.prefixSymbol")) {
      updatePrefixSymbol();
    }
  });
}
