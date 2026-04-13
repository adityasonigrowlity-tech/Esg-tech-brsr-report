const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PDF_PATH = 'D:/Growlity/Esgtech/Instruction-only-for-me/Priciple-3.pdf';

if (!fs.existsSync(PDF_PATH)) {
    console.error('PDF not found at', PDF_PATH);
    process.exit(1);
}

const buffer = fs.readFileSync(PDF_PATH);
const workerPath = path.join(__dirname, 'pdf-worker.mjs');
const child = spawn('node', [workerPath]);

let out = '';
child.stdout.on('data', d => out += d.toString());
child.on('close', () => {
    console.log('\n=== REAL TEXT VALIDATION (Structured) ===');
    
    let data;
    try {
        data = JSON.parse(out);
    } catch (e) {
        console.error('Failed to parse worker output as JSON');
        return;
    }

    const text = data.fullText;

    const test = (name, re) => {
        const m = text.match(re);
        console.log(`[${name}]:`, m ? `FOUND (cap="${m[1]}")` : 'NOT FOUND');
    };

    // The new fuzzy patterns from route.ts
    test('Fatalities Employees', /fatalities[\s\S]{0,200}?Employees[\s\S]{0,20}?\n\s*([\d,.]+(?:\s+[\d,.]+)?)/i);
    test('Fatalities Workers', /fatalities[\s\S]{0,200}?Workers[\s\S]{0,20}?\n\s*([\d,.]+(?:\s+[\d,.]+)?)/i);
    test('LTIFR Employees', /LTIFR[\s\S]{0,200}?Employees[\s\S]{0,20}?\n\s*([\d,.]+(?:\s+[\d,.]+)?)/i);
    
    if (text.toLowerCase().includes('principle 3')) console.log('Found "Principle 3"');
    else console.log('Did NOT find "Principle 3"');

    console.log('\nExtracted Pages:', data.pages.length);
    console.log('Sample Row from Page 1:', JSON.stringify(data.pages[0].rows[0]));
});
child.stdin.write(buffer);
child.stdin.end();
