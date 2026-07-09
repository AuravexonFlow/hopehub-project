const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const resourcesDir = path.join(__dirname, 'Resources');
const files = fs.readdirSync(resourcesDir);
const xlsxFile = files.find(f => f.endsWith('.xlsx') && f.includes('2025'));
const wb = XLSX.readFile(path.join(resourcesDir, xlsxFile));

function printSheet(idx) {
  const name = wb.SheetNames[idx];
  console.log('\n=== Sheet[' + idx + ']: ' + name.replace(/\s+$/, '') + ' ===');
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, {header:1});
  data.forEach((row, i) => {
    if (row && row.some(c => c != null)) console.log('  Row ' + i + ': ' + JSON.stringify(row));
  });
}

// District Secretary - sheet 34
printSheet(34);

// Governor - sheet 1
printSheet(1);

// Provincial Treasury/Finance - sheet 4
printSheet(4);

// Lands sheet 62
printSheet(62);

// Local Govt institutions - sheet 43
printSheet(43);
