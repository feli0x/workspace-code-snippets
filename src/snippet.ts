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
      prefix: `${prefixName}`,
      scope: languageId,
      body: [selection],
    },
  };
}

export {
  Snippet,
  createSnippet,
  readSnippetFile,
  writeSnippetFile,
  sanitizeName,
};
