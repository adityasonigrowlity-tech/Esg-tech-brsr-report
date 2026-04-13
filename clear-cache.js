const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');

if (fs.existsSync(nextDir)) {
  console.log('Cleaning .next directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('.next directory cleaned.');
} else {
  console.log('.next directory not found. Nothing to clean.');
}
