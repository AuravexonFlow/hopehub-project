const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const resourcesDir = path.join(__dirname, 'Resources', 'inventory');
const mainSheet = path.join(resourcesDir, 'hope hub inventory sheet.xlsx');
const distSheet = path.join(resourcesDir, 'hope hub Distribution inventory sheet.xlsx');

console.log('=== MAIN INVENTORY SHEET ===');
if (fs.existsSync(mainSheet)) {
  const wb = XLSX.readFile(mainSheet);
  wb.SheetNames.forEach(sheetName => {
    console.log(`\nSheet: "${sheetName}"`);
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws);
    
    if (data.length > 0) {
      console.log('Column names:', Object.keys(data[0]));
      console.log('First 3 rows:');
      data.slice(0, 3).forEach((row, i) => {
        console.log(`  Row ${i + 1}:`, row);
      });
    } else {
      console.log('  (No data rows)');
    }
  });
}

console.log('\n=== DISTRIBUTION INVENTORY SHEET ===');
if (fs.existsSync(distSheet)) {
  const wb = XLSX.readFile(distSheet);
  wb.SheetNames.forEach(sheetName => {
    console.log(`\nSheet: "${sheetName}"`);
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws);
    
    if (data.length > 0) {
      console.log('Column names:', Object.keys(data[0]));
      console.log('First 3 rows:');
      data.slice(0, 3).forEach((row, i) => {
        console.log(`  Row ${i + 1}:`, row);
      });
    } else {
      console.log('  (No data rows)');
    }
  });
}
