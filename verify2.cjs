const XLSX = require('xlsx');
const wb = XLSX.readFile('Resources/නව සියලු ආයතන  2025.xlsx');

function readSheet(name) {
  const ws = wb.Sheets[name];
  if (!ws) return null;
  return XLSX.utils.sheet_to_json(ws, {header:1});
}

// Check trailing spaces
wb.SheetNames.forEach((name, i) => {
  if (name.includes('අධ්‍යාපන') || name.includes('ආරක්ෂක') || name.includes('පොලිස්')) {
    console.log('Sheet[' + i + '] = [' + name + '] ends_with_space=' + name.endsWith(' '));
  }
});

console.log('\n--- Education Ministry (index 24) ---');
let data = readSheet(wb.SheetNames[24]);
if (data) {
  data.forEach((row, i) => {
    if (!row || row.every(c => c === null || c === undefined)) return;
    console.log('Row ' + i + ':', JSON.stringify(row));
  });
}

console.log('\n--- Education Dept (index 25) ---');
data = readSheet(wb.SheetNames[25]);
if (data) {
  data.forEach((row, i) => {
    if (!row || row.every(c => c === null || c === undefined)) return;
    console.log('Row ' + i + ':', JSON.stringify(row));
  });
}

console.log('\n--- Police (index 55) ---');
data = readSheet(wb.SheetNames[55]);
if (data) {
  data.forEach((row, i) => {
    if (!row || row.every(c => c === null || c === undefined)) return;
    console.log('Row ' + i + ':', JSON.stringify(row));
  });
}

console.log('\n--- Police 2 (index 56) ---');
data = readSheet(wb.SheetNames[56]);
if (data) {
  data.forEach((row, i) => {
    if (!row || row.every(c => c === null || c === undefined)) return;
    console.log('Row ' + i + ':', JSON.stringify(row));
  });
}

// Also check DS Staff row 6 specifically for the phone mismatch
console.log('\n--- DS Staff detail (sheet index 86) ---');
data = readSheet(wb.SheetNames[86]);
if (data) {
  // Row 8 = index 8 in code = 6th staff officer (ටී.බී.එන්.යු.කුමාර)
  for (let i = 3; i <= 10; i++) {
    const row = data[i];
    if (row) console.log('Row ' + i + ':', JSON.stringify(row));
  }
}
