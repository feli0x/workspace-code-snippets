import * as vscode from "vscode";
import {
  Snippet,
  createSnippet,
  readSnippetFile,
  sanitizeName,
  writeSnippetFile,
} from "./snippet";
import * as path from "path";

async function createCodeSnippet() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active text editor found.");
    return;
  }

  const selection = editor.document.getText(editor.selection);
  const name = await vscode.window.showInputBox({
    prompt: "Enter the name of the snippet",
  });
  if (!name) {
    return;
  }

  let prefixName = sanitizeName(name);
  const prefixSymbol = vscode.workspace.getConfiguration().get("prefixSymbol");

  if (prefixSymbol) {
    prefixName = `${prefixSymbol}${prefixName}`;
  }
  const snippet = createSnippet(
    name,
    prefixName,
    editor.document.languageId,
    selection
  );

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

  let snippetFileContent: Snippet = {};
  try {
    snippetFileContent = await readSnippetFile(snippetFilePath);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error reading snippet file: ${(error as Error).message}`
    );
    return;
  }

  if (snippetFileContent[name]) {
    const update = await vscode.window.showQuickPick(
      ["Change name", "Update snippet"],
      {
        placeHolder: `Snippet "${name}" already exists.`,
      }
    );
    if (update === "Change name") {
      createCodeSnippet();
      return;
    }
  }

  Object.assign(snippetFileContent, snippet);

  try {
    await writeSnippetFile(snippetFilePath, snippetFileContent);
    vscode.window.setStatusBarMessage(
      `Snippet "${name}" created successfully. You can now use it by typing "${prefixSymbol}${prefixName}" in a ${editor.document.languageId} file.`,
      30000
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error creating snippet "${name}": ${(error as Error).message}`
    );
  }
}

export { createCodeSnippet };
