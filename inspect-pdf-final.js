const pdf = require('pdf-parse');
console.log('Type of pdf-parse export:', typeof pdf);
if (typeof pdf === 'object') {
    console.log('Keys:', Object.keys(pdf));
}
// Try calling it if it's a function
if (typeof pdf === 'function') {
    console.log('It is a function!');
}
