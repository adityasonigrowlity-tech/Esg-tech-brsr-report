#!/usr/bin/env node
'use strict';

/**
 * PDF Worker (CJS) — Uses dynamic import for ESM-only pdfjs-dist.
 */

const Y_TOLERANCE = 3;

async function extractTextWithStructure(buffer) {
  // ESM-only package loaded dynamically in CJS
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    useSystemFonts: true,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;
  const pages = [];
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const items = textContent.items.map(item => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
    }));

    // Group items into rows
    const rowsMap = [];
    for (const item of items) {
      let found = rowsMap.find(r => Math.abs(r.y - item.y) < Y_TOLERANCE);
      if (found) {
        found.cells.push(item);
      } else {
        rowsMap.push({ y: item.y, cells: [item] });
      }
    }

    // Sort rows from top to bottom (Y is bottom-up in PDF)
    const sortedRows = rowsMap
      .sort((a, b) => b.y - a.y)
      .map(row => ({
        y: Math.round(row.y),
        cells: row.cells
          .sort((a, b) => a.x - b.x)
          .map(cell => cell.text)
          .filter(txt => txt.trim().length > 0)
      }))
      .filter(row => row.cells.length > 0);

    pages.push({
      pageNum: i,
      rows: sortedRows
    });

    fullText += sortedRows.map(r => r.cells.join("\t")).join("\n") + "\n";
  }

  return { pages, fullText };
}

const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', async () => {
  try {
    const buffer = Buffer.concat(chunks);
    console.error(`[pdf-worker] Received buffer: ${buffer.length} bytes`);
    
    if (buffer.length === 0) {
      throw new Error('Empty buffer received');
    }
    
    // Check PDF header
    const header = buffer.slice(0, 8).toString('ascii');
    console.error(`[pdf-worker] PDF header: ${header}`);
    if (!header.startsWith('%PDF-')) {
      throw new Error(`Invalid PDF header: ${header}`);
    }
    
    const data = await extractTextWithStructure(buffer);
    
    if (!data.fullText || data.fullText.trim().length === 0) {
      console.error('[pdf-worker] WARNING: Extracted text is empty!');
    } else {
      console.error(`[pdf-worker] Extracted ${data.fullText.length} chars from ${data.pages.length} pages`);
    }
    
    process.stdout.write(JSON.stringify(data));
    process.exit(0);
  } catch (err) {
    console.error('[pdf-worker] FATAL:', err.message);
    process.stderr.write(JSON.stringify({ error: err.message, stack: err.stack }));
    process.exit(1);
  }
});
