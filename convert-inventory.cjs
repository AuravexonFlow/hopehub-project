const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const resourcesDir = path.join(__dirname, 'Resources', 'inventory');
const srcDir = path.join(__dirname, 'src', 'data');

// Category mapping
const categoryMap = {
  'Stationary': 'd1',
  'Books': 'd1',
  'Clothing': 'd2',
  'Uniform': 'd2',
  'Sports': 'd4',
  'Food': 'd5',
  'Educational': 'd1',
  'Other': 'd3',
};

function getCategoryId(category) {
  if (!category) return 'd1';
  const normalized = category.trim();
  return categoryMap[normalized] || 'd1';
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') {
    // Convert from 2025.08.25 format to 2025-08-25
    return dateValue.replace(/\./g, '-');
  }
  if (typeof dateValue === 'number') {
    // Excel date number
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  return '';
}

function formatItems(itemName, description, quantity, unit) {
  const parts = [];
  if (quantity && quantity !== '') parts.push(String(quantity).trim());
  if (itemName) parts.push(String(itemName).trim());
  if (description && description !== '') parts.push(`(${String(description).trim()})`);
  if (unit && unit !== 'Piece' && unit !== 'pcs') parts.push(String(unit).trim());
  return parts.filter(p => p && String(p).trim()).join(' ');
}

// Read the main inventory sheet
const mainSheet = path.join(resourcesDir, 'hope hub inventory sheet.xlsx');
const distSheet = path.join(resourcesDir, 'hope hub Distribution inventory sheet.xlsx');

console.log('Reading inventory sheets...');

let receivedTransactions = [];
let distributedTransactions = [];
let receivedCounter = 1;
let distributedCounter = 1;

// Process main inventory sheet "Inventory" sheet (received items)
if (fs.existsSync(mainSheet)) {
  console.log('Processing main inventory sheet...');
  const wb = XLSX.readFile(mainSheet);
  
  const invSheet = wb.Sheets['Inventory'];
  if (invSheet) {
    console.log('  Processing "Inventory" sheet');
    const data = XLSX.utils.sheet_to_json(invSheet);
    
    data.forEach((row) => {
      if (!row['Item name'] || !row['Item name'].trim()) return;
      
      const itemName = row['Item name'] || '';
      const description = row['Discription'] || '';
      const quantity = row['Quntity available'] || '';
      const unit = row['Unit'] || '';
      
      const transaction = {
        id: `sheet-r-${String(receivedCounter).padStart(3, '0')}`,
        type: 'received',
        contactName: row['Doner'] || 'Unknown',
        categoryId: getCategoryId(row['Catogery']),
        items: formatItems(itemName, description, quantity, unit),
        date: formatDate(row['Date Received']),
        notes: 'Added from Hope Hub inventory sheet',
        created_at: formatDate(row['Date Received']),
      };
      
      if (transaction.items.trim()) {
        receivedTransactions.push(transaction);
        receivedCounter++;
      }
    });
  }
}

// Process distribution inventory sheet "Distribution Inventory" sheet (distributed items)
if (fs.existsSync(distSheet)) {
  console.log('Processing distribution inventory sheet...');
  const wb = XLSX.readFile(distSheet);
  
  const distInvSheet = wb.Sheets['Distribution Inventory'];
  if (distInvSheet) {
    console.log('  Processing "Distribution Inventory" sheet');
    const data = XLSX.utils.sheet_to_json(distInvSheet);
    
    data.forEach((row) => {
      if (!row['ITEM NAME'] || !row['ITEM NAME'].trim()) return;
      
      const itemName = row['ITEM NAME'] || '';
      const quantity = row['QUNTITY GIVEN'] || '';
      const unit = row['UNIT'] || '';
      
      const transaction = {
        id: `sheet-d-${String(distributedCounter).padStart(3, '0')}`,
        type: 'distributed',
        contactName: row['STUDENT NAME'] || row['ADDRESS'] || 'Unknown',
        categoryId: 'd1', // Default to stationary for distribution
        items: formatItems(itemName, '', quantity, unit),
        date: formatDate(row['DATE']),
        notes: `${row['PURPOSE/ REASON'] || 'Distributed'} | Issued by ${row['ISSUED BY'] || 'N/A'} | Source: ${row['DONER/ FUNDING SOURCES'] || 'N/A'}`,
        created_at: formatDate(row['DATE']),
      };
      
      if (transaction.items.trim()) {
        distributedTransactions.push(transaction);
        distributedCounter++;
      }
    });
  }
}

const allTransactions = [...receivedTransactions, ...distributedTransactions];
console.log(`Total transactions found: ${allTransactions.length} (Received: ${receivedTransactions.length}, Distributed: ${distributedTransactions.length})`);

// Generate TypeScript file
const output = `/**
 * Auto-generated from the Hope Hub inventory workbooks.
 * Do not edit by hand; regenerate from the XLSX sheets instead.
 */

export const inventorySheetTransactions = [
${allTransactions.map(t => `  {
    id: '${t.id}', type: '${t.type}',
    contactName: '${t.contactName.replace(/'/g, "\\'")}',
    categoryId: '${t.categoryId}', items: '${t.items.replace(/'/g, "\\'")}',
    date: '${t.date}', notes: '${t.notes.replace(/'/g, "\\'")}',
    created_at: '${t.created_at}',
  },`).join('\n')}
] as const;
`;

const outputPath = path.join(srcDir, 'inventory-sheets.ts');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ Generated ${outputPath}`);
console.log(`   Total records: ${allTransactions.length}`);
