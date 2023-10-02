import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createWorkspaceSnippet",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!selectedText) {
        vscode.window.showErrorMessage("No text selected");
        return;
      }

      const snippetPrefix = await vscode.window.showInputBox({
        prompt: "Enter the snippet prefix",
        value: "mySnippet",
      });

      if (!snippetPrefix) {
        vscode.window.showErrorMessage("No snippet prefix entered");
        return;
      }

      const snippetContent = selectedText;

      const snippetsFilePath = path.join(
        vscode.workspace.rootPath || "",
        ".vscode",
        "workspace.code-snippets"
      );

      try {
        // Create the .vscode directory if it doesn't exist
        fs.mkdirSync(path.dirname(snippetsFilePath), { recursive: true });

        // Create the workspace.code-snippets file if it doesn't exist
        if (!fs.existsSync(snippetsFilePath)) {
          fs.writeFileSync(snippetsFilePath, "{}");
        }

        // Read the contents of the workspace.code-snippets file
        const snippetsFileContent = fs.readFileSync(snippetsFilePath, "utf8");

        // Parse the contents of the file as JSON
        const snippets = JSON.parse(snippetsFileContent);

        // Add the new snippet to the JSON object
        snippets[snippetPrefix] = snippetContent;

        // Write the updated JSON object to the workspace.code-snippets file
        fs.writeFileSync(snippetsFilePath, JSON.stringify(snippets, null, 2));

        vscode.window.showInformationMessage(
          `Snippet '${snippetPrefix}' created`
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error creating snippet: ${error.message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}
