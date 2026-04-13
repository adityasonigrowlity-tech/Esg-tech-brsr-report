const { PDFParse } = require('pdf-parse');
const p = new PDFParse();
console.log('PDFParse type:', typeof PDFParse);
console.log('instance methods:', Object.getOwnPropertyNames(PDFParse.prototype));
