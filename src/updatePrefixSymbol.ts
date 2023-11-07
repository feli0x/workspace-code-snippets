import * as vscode from "vscode";
import * as path from "path";
import { Snippet, readSnippetFile, writeSnippetFile } from "./snippet";

/**
 * Updates the prefix symbol of all snippets in the workspace.code-snippets file.
 * If the `prefixSymbol` configuration setting is set, replaces all non-alphanumeric characters in the prefix with it.
 * @returns void
 */
function updatePrefixSymbol() {
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

  readSnippetFile(snippetFilePath).then((snippetFileContent) => {
    const specialCharRegex = /[^a-zA-Z0-9]/g;
    const hasSpecialChar = Object.keys(snippetFileContent).some((key) =>
      specialCharRegex.test(snippetFileContent[key].prefix)
    );

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

    writeSnippetFile(snippetFilePath, newSnippetFileContent);
  });
}

export { updatePrefixSymbol };
