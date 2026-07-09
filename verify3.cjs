const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Find the excel file
const resourcesDir = path.join(__dirname, 'Resources');
const files = fs.readdirSync(resourcesDir);
const xlsxFile = files.find(f => f.endsWith('.xlsx'));
const wb = XLSX.readFile(path.join(resourcesDir, xlsxFile));

// Sheet 65 = Transport (මාර්ගප්‍රවාහන)
console.log('--- Transport Sheet (index 65):', wb.SheetNames[65], '---');
const ws = wb.Sheets[wb.SheetNames[65]];
const data = XLSX.utils.sheet_to_json(ws, {header:1});
data.forEach((row, i) => { if (row && row.some(c => c != null)) console.log('Row ' + i + ':', JSON.stringify(row)); });

// Also check Governor sheet for row 7
console.log('\n--- Governor Sheet (index 28) - row 7 ---');
const gWs = wb.Sheets[wb.SheetNames[28]];
const gData = XLSX.utils.sheet_to_json(gWs, {header:1});
for (let i = 0; i <= 15; i++) {
  const row = gData[i];
  if (row) console.log('Row ' + i + ':', JSON.stringify(row));
}
