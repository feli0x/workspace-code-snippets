import * as vscode from "vscode";
import * as path from "path";
import { Snippet, readSnippetFile, writeSnippetFile } from "./snippet";

function updatePrefixSymbol() {
  // Get the path to the snippet file
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

  // Read the snippet file
  readSnippetFile(snippetFilePath).then((snippetFileContent) => {
    // Check if any snippet prefix contains a special character
    const specialCharRegex = /[^a-zA-Z0-9]/g;
    const hasSpecialChar = Object.keys(snippetFileContent).some((key) =>
      specialCharRegex.test(snippetFileContent[key].prefix)
    );

    // Update the snippets
    const newSnippetFileContent: Snippet = {};
    Object.keys(snippetFileContent).forEach((key) => {
      const snippet = snippetFileContent[key];
      let newPrefix = snippet.prefix;
      if (hasSpecialChar) {
        const prefixSymbol = vscode.workspace
          .getConfiguration()
          .get("prefixSymbol") as string;
        newPrefix = newPrefix.replace(specialCharRegex, prefixSymbol);
      }
      const newSnippet = {
        ...snippet,
        prefix: newPrefix,
      };
      newSnippetFileContent[key] = newSnippet;
    });

    // Write the updated snippets to the file
    writeSnippetFile(snippetFilePath, newSnippetFileContent);
  });
}

export { updatePrefixSymbol };
