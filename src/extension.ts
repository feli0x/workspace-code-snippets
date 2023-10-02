import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.createWorkspaceCodeSnippet",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      const selection = editor.document.getText(editor.selection);
      let name = await vscode.window.showInputBox({
        prompt: "Enter the name of the snippet",
      });
      if (!name) {
        return;
      }

      // Sanitize the name for the prefix
      const prefixName = name.replace(/[^a-zA-Z0-9]/g, "-");

      // Create the snippet
      const snippet = {
        [name]: {
          prefix: `/${prefixName}`,
          scope: editor.document.languageId,
          body: [selection],
        },
      };

      // Write the snippet to the workspace file
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }

      const snippetFilePath = path.join(
        workspaceFolder.uri.fsPath,
        ".vscode",
        "workspace.code-snippets"
      );

      let snippetFileContent = {};
      try {
        const snippetFileContentBuffer = await fs.readFile(snippetFilePath);
        snippetFileContent = JSON.parse(snippetFileContentBuffer.toString());
      } catch (error) {
        // Ignore errors when reading the snippet file
      }

      Object.assign(snippetFileContent, snippet);

      try {
        await fs.writeFile(
          snippetFilePath,
          JSON.stringify(snippetFileContent, null, 2)
        );
        vscode.window.showInformationMessage(
          `Snippet "${name}" created successfully. You can now use it by typing "/${prefixName}" in a file.`
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error creating snippet "${name}": ${(error as Error).message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}
