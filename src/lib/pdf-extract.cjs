/**
 * Custom PDF extraction wrapper for Next.js App Router (Node.js runtime).
 * 
 * WHY: Both pdf-parse (ENOENT debug bug) and pdfjs-dist v4 (worker .mjs required)
 * fail in Next.js Turbopack. This wrapper uses pdf-parse's internal lib directly
 * via Module._resolveFilename bypass, avoiding the debug entrypoint.
 */

// Directly require the inner library file (not the buggy index.js)
// This is safe because pdf-parse@1.1.1's lib/pdf-parse.js has no debug code.
const pdfParseLib = require('pdf-parse/lib/pdf-parse.js');

/**
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractText(buffer) {
  const data = await pdfParseLib(buffer);
  return data.text;
}

module.exports = { extractText };
