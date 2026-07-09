const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const resourcesDir = path.join(__dirname, 'Resources');
const files = fs.readdirSync(resourcesDir);

// Find all xlsx files
const xlsxFiles = files.filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));
console.log('XLSX files found:', xlsxFiles);

// Use the Sinhala file specifically
const target = xlsxFiles.find(f => f.includes('2025'));
console.log('Target file:', target);

const wb = XLSX.readFile(path.join(resourcesDir, target));
console.log('Total sheets:', wb.SheetNames.length);
wb.SheetNames.forEach((name, i) => {
  console.log('[' + i + '] "' + name.replace(/\s+$/, '') + '"');
});
