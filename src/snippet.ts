import * as fs from "fs/promises";

interface Snippet {
  [name: string]: {
    prefix: string;
    scope: string;
    body: string[];
  };
}

/**
 * Reads a snippet file and returns a snippet object.
 * @param snippetFilePath - The path of the file to read.
 * @returns A Snippet object.
 */
async function readSnippetFile(snippetFilePath: string): Promise<Snippet> {
  try {
    const snippetFileContentBuffer = await fs.readFile(snippetFilePath);
    return JSON.parse(snippetFileContentBuffer.toString());
  } catch (error) {
    return {};
  }
}

/**
 * Writes a snippet object to a file.
 * @param snippetFilePath - The path of the file to write to.
 * @param snippet - The snippet object to write to the file.
 * @throws An error if there was a problem writing the file.
 */
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

/**
 * Creates a snippet object with the given name, prefix, language ID, and selection.
 * @param name - The name of the snippet.
 * @param prefixName - The prefix of the snippet.
 * @param languageId - The language ID of the snippet.
 * @param selection - The code snippet.
 * @returns A Snippet object.
 */
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
