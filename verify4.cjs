const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const resourcesDir = path.join(__dirname, 'Resources');
const files = fs.readdirSync(resourcesDir);
const xlsxFile = files.find(f => f.endsWith('.xlsx') && f.includes('2025'));
const wb = XLSX.readFile(path.join(resourcesDir, xlsxFile));

function readSheet(idx) {
  const ws = wb.Sheets[wb.SheetNames[idx]];
  if (!ws) return null;
  return XLSX.utils.sheet_to_json(ws, {header:1});
}

function printSheet(idx) {
  const name = wb.SheetNames[idx];
  console.log('\n=== Sheet[' + idx + ']: ' + name.replace(/\s+$/, '') + ' ===');
  const data = readSheet(idx);
  if (!data) { console.log('  (no data)'); return; }
  data.forEach((row, i) => {
    if (row && row.some(c => c != null)) console.log('  Row ' + i + ': ' + JSON.stringify(row));
  });
}

// Health - sheet 11
printSheet(11);

// Finance - sheet 31
printSheet(31);

// Agriculture zones - sheet 17
printSheet(17);

// Agriculture dept - sheet 18
printSheet(18);

// Irrigation dept - sheet 19
printSheet(19);

// Irrigation institutions - sheet 60
printSheet(60);

// Lands - sheet 26
printSheet(26);

// Buildings/Samurdhi/etc - sheet 61
printSheet(61);

// Local Govt dept - sheet 14
printSheet(14);

// Transport - sheet 65
printSheet(65);
