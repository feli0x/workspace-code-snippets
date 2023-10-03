import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";

interface Snippet {
  [name: string]: {
    prefix: string;
    scope: string;
    body: string[];
  };
}

async function readSnippetFile(snippetFilePath: string): Promise<Snippet> {
  try {
    const snippetFileContentBuffer = await fs.readFile(snippetFilePath);
    return JSON.parse(snippetFileContentBuffer.toString());
  } catch (error) {
    return {};
  }
}

async function writeSnippetFile(
  snippetFilePath: string,
  snippet: Snippet
): Promise<void> {
  try {
    await fs.writeFile(snippetFilePath, JSON.stringify(snippet, null, 2));
  } catch (error) {
    throw new Error(`Error writing snippet file: ${(error as Error).message}`);
  }
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "-");
}

function createSnippet(
  name: string,
  prefixName: string,
  languageId: string,
  selection: string
): Snippet {
  return {
    [name]: {
      prefix: `/${prefixName}`,
      scope: languageId,
      body: [selection],
    },
  };
}

async function createWorkspaceCodeSnippet() {
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

  const prefixName = sanitizeName(name);
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
      createWorkspaceCodeSnippet();
      return;
    }
  }

  Object.assign(snippetFileContent, snippet);

  try {
    await writeSnippetFile(snippetFilePath, snippetFileContent);
    vscode.window.setStatusBarMessage(
      `Snippet "${name}" created successfully. You can now use it by typing "/${prefixName}" in a ${editor.document.languageId} file.`,
      30000
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error creating snippet "${name}": ${(error as Error).message}`
    );
  }
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.createWorkspaceCodeSnippet",
    createWorkspaceCodeSnippet
  );

  context.subscriptions.push(disposable);
}
