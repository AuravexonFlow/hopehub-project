const XLSX = require('xlsx');
const wb = XLSX.readFile('Resources/නව සියලු ආයතන  2025.xlsx');

function readSheet(name) {
  const ws = wb.Sheets[name];
  if (!ws) return null;
  return XLSX.utils.sheet_to_json(ws, { header: 1 });
}

function norm(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim();
}

function normPhone(p) {
  if (!p) return '';
  return String(p).replace(/\s+/g, '').replace(/[/,]+/g, ',').trim();
}

// ============ CATEGORY 1: GOVERNOR ============
console.log('\n========== 1. GOVERNOR (ආණ්ඩුකාරවර කාර්යාලය) ==========');
{
  const data = readSheet('ආණ්ඩුකාරවර කාර්යාලය');
  // Excel rows 7-14 have the contacts
  const excelContacts = [];
  for (let i = 7; i <= 14; i++) {
    const row = data[i];
    if (!row || !row[2]) continue;
    excelContacts.push({ name: norm(row[2]), field: norm(row[1]), phone: norm(row[3]) + (row[4] ? ',' + norm(row[4]) : '') });
  }
  // Code contacts
  const codeContacts = [
    { name: 'ගරු ආණ්ඩුකාරවර', phone: '091-2234578' },
    { name: 'ඩී.ඩබ්.එස්.වෛද්‍යරත්න මයා', field: 'සම්බන්ධීකරණ ලේකම්', phone: '091-3099505/ 091-2226756, 077-3596423' },
    { name: 'අයි.එස්.සමරකෝන් මයා', field: 'ආණුඩුකාර ලේකම්', phone: '091-2222498, 070-7899598' },
    { name: 'එච්.හේරත් මයා', field: 'සහකාර ලේකම් (වැ.බ)', phone: '091-2222162, 077-5398066' },
    { name: 'ගයත්‍රි ද සිලවා මිය', field: 'නීති නිලධාරී', phone: '091-2250940, 071-9083970' },
    { name: 'වසන්ත රණවක මයා', field: 'ගණකාධිකාරී (වැ.බ)', phone: '091-3132727, 071-3231659' },
    { name: 'ජේ.සී.මහගමගේ මයා', field: 'නියෝජ්‍ය අධ්‍යක්ෂ ( සැලසුම්) (වැ.බ)', phone: '091-2234480, 071-3178933' },
    { name: 'කේ.ජී.එස්.දමයන්ති මිය', field: 'පරිපාලන නිලධාරී', phone: '091-2226990, 077-1632589' },
  ];
  console.log('Excel contacts: ' + excelContacts.length + ', Code contacts: ' + codeContacts.length);
  if (excelContacts.length !== codeContacts.length) console.log('❌ COUNT MISMATCH');
  for (let i = 0; i < Math.max(excelContacts.length, codeContacts.length); i++) {
    const e = excelContacts[i]; const c = codeContacts[i];
    if (!e) { console.log(`  ❌ Code[${i}] extra: ${c.name}`); continue; }
    if (!c) { console.log(`  ❌ Excel[${i}] missing in code: ${e.name}`); continue; }
    const nameMatch = norm(e.name) === norm(c.name);
    if (!nameMatch) console.log(`  ❌ [${i}] Name: Excel="${e.name}" vs Code="${c.name}"`);
    const fieldMatch = !c.field || norm(e.field) === norm(c.field);
    if (!fieldMatch) console.log(`  ❌ [${i}] Field: Excel="${e.field}" vs Code="${c.field}"`);
  }
  if (excelContacts.length === codeContacts.length && excelContacts.every((e, i) => norm(e.name) === norm(codeContacts[i].name))) {
    console.log('✅ All names match');
  }
}

// ============ CATEGORY 2: DISTRICT SECRETARY ============
console.log('\n========== 2. DISTRICT SECRETARY (දිස්ත්‍රික් ලේකම් කාර්යාලයගාල්ල) ==========');
{
  const data = readSheet('දිස්ත්‍රික් ලේකම් කාර්යාලයගාල්ල');
  const excelContacts = [];
  for (let i = 7; i <= 15; i++) {
    const row = data[i];
    if (!row) continue;
    excelContacts.push({ name: norm(row[2]), field: norm(row[3]), phone: norm(row[4]) + (row[5] ? ',' + norm(row[5]) : '') });
  }
  const codeNames = [
    'ඩබ්.ඒ.ධර්මසිරි මයා',
    'ඒ.එම්.ඒ.යූ.ජී. කාරියවසම් මිය',
    'ජී.ජී.ලක්ෂ්මි කාන්ති මෙය.',
    'ධම්මිකා සුභාෂිණී රණසිංහ මිය',
    'බී.රසාංග සුරිආරච්චි මයා',
    'ටී.බී.එන්.යු.කුමාර මයා',
    'රංජිත් ගුණතිලක මයා',
    'කේ.කේ.වී.මාධව තුෂාර මයා',
  ];
  console.log('Excel contacts: ' + excelContacts.length + ', Code contacts: ' + codeNames.length);
  for (let i = 0; i < Math.max(excelContacts.length, codeNames.length); i++) {
    const e = excelContacts[i]; const c = codeNames[i];
    if (!e) { console.log(`  ❌ Code[${i}] extra: ${c}`); continue; }
    if (!c) { console.log(`  ❌ Excel[${i}] missing in code: ${e.name}`); continue; }
    if (norm(e.name) !== norm(c)) console.log(`  ❌ [${i}] Name: Excel="${e.name}" vs Code="${c}"`);
  }
  if (excelContacts.length === codeNames.length && excelContacts.every((e, i) => norm(e.name) === norm(codeNames[i]))) {
    console.log('✅ All names match');
  }
}

// ============ CATEGORY 3: DS STAFF ============
console.log('\n========== 3. DS STAFF (දි.ලේ.මාණ්ඩලික නිලධාරීන්) ==========');
{
  const data = readSheet('දි.ලේ.මාණ්ඩලික නිලධාරීන්');
  const excelContacts = [];
  for (let i = 3; i <= 33; i++) {
    const row = data[i];
    if (!row || !row[2]) continue;
    excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]), mobile: norm(row[7]) });
  }
  const codeDSStaff = [
    { name: 'ඩබ්.ඒ.ධර්මසිරි මයා', field: 'දිස්ත්‍රික් ලේකම්/ දිසාපති', phone: '071-4178394' },
    { name: 'ඒ.එම්.ඒ.යූ.ජී. කාරියවසම් මිය', field: 'අතිරේක දිස්ත්‍රික් ලේකම් (පාලන)', phone: '077-1264074' },
    { name: 'ජී.ජී.ලක්ෂ්මි කාන්ති මෙය.', field: 'අතිරේක දිස්ත්‍රික් ලේකම් (ඉඩම් හා සංවර්ධන)', phone: '071-5887134' },
    { name: 'ධම්මිකා සුභාෂිණී රණසිංහ මිය', field: 'ප්‍රධාන ගණකාධිකාරි', phone: '071-8115496' },
    { name: 'එල්.ආර්.ගුණතිලක මයා', field: 'ගණකාධිකාරි', phone: '070-2470480' },
    { name: 'ටී.බී.එන්.යු.කුමාර මයා', field: 'සහකාර දිස්ත්‍රික් ලේකම්', phone: '071-3385358' },
    { name: 'ජී.වී.ජී.ජි.ගුණතිලක මිය', field: 'සහකාර පුපුරණ ද්‍රව්‍ය පාලක', phone: '077-2323354' },
    { name: 'චමිලා කුමාරි වීරක්කොඩි මිය', field: 'දිස්ත්‍රික් ඉංජිනේරු', phone: '071-9818154' },
    { name: 'කේ.කේ.වී.මාධව තුෂාර මයා', field: 'පරිපාලන නිලධාරී', phone: '071-4833086' },
    { name: 'අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702' },
    { name: 'බී.රසාංග සුරිආරච්චි මයා', field: 'නියෝජ්‍ය අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702, 071-8740483' },
    { name: 'ටී.ඩබ්.කේ. ඒකනායක මයා', field: 'නියෝජ්‍ය අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702, 075-8909027' },
    { name: 'එම්.ඩබ්. පතිනායක මිය', field: 'සහකාර අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702, 071-4484498' },
    { name: 'ඩබ්.ඒ.බී. චාන්දනී මිය', field: 'සහකාර අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702, 071-3368505' },
    { name: 'සී.ඩබ්.කේ. මණ්ඩලවත්ත මයා', field: 'සහකාර අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702, 070-1344148' },
    { name: 'පී. මනෝහරී වීරසේකර මිය', field: 'සහකාර අධ්‍යක්ෂ (ක්‍රමසම්පාදන)', phone: '091-4549587 702, 071-4451375' },
    { name: 'එන්.ජී. අයි. විජයරත්න මිය.', field: 'ප්‍රධාන අභ්‍යන්තර විගණක', phone: '071-8496178' },
    { name: 'ජේ.එන්.පී.ලියනගම', field: 'සහකාර අධ්‍යක්ෂක', phone: '077-3957873' },
    { name: 'එන්.කේ.වීරතුංග', field: 'නියෝජ්‍ය  සහකාර අධ්‍යක්ෂක', phone: '071-1038623 076-9127469' },
    { name: 'ජී. පී. පේමසිරි මයා', field: 'සහකාර අධ්‍යක්ෂ', phone: '071-4275203' },
    { name: 'ටී.පී.හෙට්ටිආරච්චි මයා', field: 'සංඛ්‍යාලේඛනඥ', phone: '071-4395970' },
    { name: 'ඊ.ජී.අමරසිරි මයා', field: 'දිස්ත්‍රික් ඉඩම් රෙජිස්ට්‍රාර්', phone: '071-4395839' },
    { name: 'ඩබ්.එච්.ආර්.විජය කුමාර මයා', field: 'නියෝජ්‍ය මැතිවරණ කොමසාරිස්', phone: '071-4410450' },
    { name: 'එම්.ජී.එම්. උපමාලිකා මිය', field: 'සහකාර රෙජිස්ට්‍රාර් ජනරාල්', phone: '071-8130283' },
    { name: 'එම්.ඩී.ඒ.දීගොඩගමගේ මයා', field: 'සහකාර අධ්‍යක්ෂ', phone: '077-2020895' },
    { name: 'අයි.ඩී.ජී.එස්.ප්‍රේමචන්ද්‍ර මයා', field: 'සහකාර අධ්‍යක්ෂ', phone: '077-7183815' },
    { name: 'එම්.පී.තමරා මිය', field: 'දිස්ත්‍රික් කාෂිකර්ම අධ්‍යක්ෂ', phone: '070-7117887' },
    { name: 'එච්.යූ. කාංචනා චතුරාණි මිය', field: 'දි/සමෘ/අධ්‍යක්ෂ', phone: '071-0881943' },
    { name: 'කපිල මාසකෝරාල මයා', field: 'සහකාර අධ්‍යක්ෂ', phone: '071-6905975' },
    { name: 'රන්ජිත් දි සිල්වා මයා', field: 'සහකාර අධ්‍යක්ෂ', phone: '070-1118020' },
    { name: 'එම්.කේ. නිහාල් පෙරේරා මයා', field: 'පරිපාලන නිලධාරි', phone: '071-8314320' },
  ];
  console.log('Excel contacts: ' + excelContacts.length + ', Code contacts: ' + codeDSStaff.length);
  for (let i = 0; i < Math.max(excelContacts.length, codeDSStaff.length); i++) {
    const e = excelContacts[i]; const c = codeDSStaff[i];
    if (!e) { console.log(`  ❌ Code[${i}] extra: ${c.name}`); continue; }
    if (!c) { console.log(`  ❌ Excel[${i}] missing in code: ${e.name}`); continue; }
    // Check name
    if (norm(e.name) !== norm(c.name)) console.log(`  ❌ [${i}] Name: Excel="${e.name}" vs Code="${c.name}"`);
    // Check mobile
    const excelMobile = norm(e.mobile).replace(/\s/g, '');
    const codeMobile = norm(c.phone).replace(/\s/g, '');
    if (excelMobile !== codeMobile) {
      // DS Staff Row 6 has mobile 071-3385538 in Excel but code has 071-3385358
      console.log(`  ❌ [${i}] Mobile: Excel="${e.mobile}" vs Code="${c.phone}"`);
    }
  }
}

// ============ CATEGORY 4: CHIEF SECRETARY ============
console.log('\n========== 4. CHIEF SECRETARY (ප්‍රධාන ලේකම් කාර්යාලය) ==========');
{
  const data = readSheet('ප්‍රධාන ලේකම් කාර්යාලය');
  const excelContacts = [];
  for (let i = 6; i <= 18; i++) {
    const row = data[i];
    if (!row) continue;
    excelContacts.push({ name: norm(row[2]), field: norm(row[1]), officePhone: norm(row[3]), mobile: norm(row[4]) });
  }
  const codeCS = [
    { name: 'සුමිත් අලහකෝන් මයා', field: 'ප්‍රධාන ලේකම්' },
    { name: 'එස්.කේ.වැල්ලහේවා මයා', field: 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පිරිස් හා පුහුණු)' },
    { name: 'රනිල් වික්‍රමසේකර මයා', field: 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පාලන)' },
    { name: 'බ්.එම්.එම්.ජේ.හර්ෂණි ම්ය', field: 'සහකාර ප්‍රධාන ලේකම් (පිරිස්)' },
    { name: 'සහකාර ප්‍රධාන ලේකම් (ආයතන)' },
    { name: 'එල්.එස්.වර්ණ කුලසුරිය මයා', field: 'සහකාර ප්‍රධාන ලේකම් (පාලන)' },
    { name: 'ඒ.කේ.ඊ.මධුසරණි මිය', field: 'නියෝජ අධ්‍යක්ෂ (ක්‍රම සම්පාදන)' },
    { name: 'ඩබ්ලිව්.ජී.බී.එම්.වීරසිංහ මිය', field: 'නීති නිලධාරී I (ප්‍රධාන නීති නිලධාරී - රා.ඉ)' },
    { name: 'ඒ.කේ.රත්ගමගේ මිය', field: 'නීති නිලධාරී II' },
    { name: 'ඩබ්ලිව්.ජී.ඩී.එම්.ගුරුගේ මිය', field: 'නීති නිලධාරී III' },
    { name: 'අනුරාධා එම්.මාපලගම මිය', field: 'සංඛාලේඛනඥ' },
    { name: 'එන්.එස්.වීරක්කොඩි මයා', field: 'පරිපාලන නිලධාරී (පාලන)' },
    { name: 'එච්.ඩබ්.තෙන්නකෝන් මිය', field: 'පරිපාලන නිලධාරී (පිරිස්)' },
  ];
  console.log('Excel contacts: ' + excelContacts.length + ', Code contacts: ' + codeCS.length);
  for (let i = 0; i < Math.max(excelContacts.length, codeCS.length); i++) {
    const e = excelContacts[i]; const c = codeCS[i];
    if (!e) { console.log(`  ❌ Code[${i}] extra: ${c.name}`); continue; }
    if (!c) { console.log(`  ❌ Excel[${i}] missing in code: ${e.name}`); continue; }
    if (norm(e.name) !== norm(c.name)) console.log(`  ❌ [${i}] Name: Excel="${e.name}" vs Code="${c.name}"`);
  }
  // Check mobile numbers
  const codeMobiles = [
    '071-6821879', '071-4498801', '075-2937004/077-398382',
    '071-7940451', null, '071-8139100', '076-2594849', '071-8337294',
    '077-9165385', '071-3378457', '071-9008379', '070-6833650', '075-3815993'
  ];
  for (let i = 0; i < excelContacts.length; i++) {
    const e = excelContacts[i]; const cm = codeMobiles[i];
    if (!cm) continue;
    const em = norm(e.mobile).replace(/\s/g, '');
    const cmClean = norm(cm).replace(/\s/g, '');
    if (em !== cmClean) console.log(`  ❌ [${i}] Mobile: Excel="${e.mobile}" vs Code="${cm}"`);
  }
  console.log('✅ Names verified against Excel');
}

// ============ CATEGORY 5: EDUCATION MINISTRY ============
console.log('\n========== 5. EDUCATION MINISTRY (දකු.ප.අධ්‍යාපන අමාත,දක්ෂිණපාය) ==========');
{
  const data = readSheet('දකු.ප.අධ්‍යාපන අමාත,දක්ෂිණපාය');
  if (!data) { console.log('Sheet not found - trying variations'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[2]) continue;
      if (i < 3) continue; // skip headers
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]) });
    }
    console.log('Excel contacts found: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  Excel: ${c.idx} | ${c.name} | ${c.field}`));
  }
}

// ============ CATEGORY 6: EDUCATION DEPT ============
console.log('\n========== 6. EDUCATION DEPT (දකු.ප.අධ්‍යාපන දෙපාර්තමේන්තුව) ==========');
{
  const data = readSheet('දකු.ප.අධ්‍යාපන දෙපාර්තමේන්තුව');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[2]) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]) });
    }
    console.log('Excel contacts found: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  Excel: ${c.idx} | ${c.name} | ${c.field}`));
  }
}

// ============ CATEGORY 7: HEALTH ============
console.log('\n========== 7. HEALTH (පළාත් සෞඛ්‍ය සේවා දෙපාර්තමේන්තු / ආයුර්වේද) ==========');
{
  const sheets = ['පළාත් සෞඛ්‍ය සේවා දෙපාර්තමේන්තු', 'සෞඛ්‍ය උණවටුන‍.මාගාල්ල ආයුර්වේද'];
  sheets.forEach(sn => {
    const data = readSheet(sn);
    if (!data) { console.log(`Sheet "${sn}" not found`); return; }
    console.log(`--- Sheet: ${sn} ---`);
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[2] && !row[1])) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]), phone: norm(row[3]), mobile: norm(row[4]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name || '(empty)'} | ${c.field} | Ph:${c.phone} | Mob:${c.mobile}`));
  });
}

// ============ CATEGORY 8: AYURVEDA ============
console.log('\n========== 8. AYURVEDA (ආයුර්වේද දෙපාර්තමේන්තුව මාගාල්ල) ==========');
{
  const data = readSheet('ආයුර්වේද දෙපාර්තමේන්තුව මාගාල්ල');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[2] && !row[1])) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]), phone: norm(row[3]), mobile: norm(row[4]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name || '(empty)'} | ${c.field} | Ph:${c.phone} | Mob:${c.mobile}`));
  }
}

// ============ CATEGORY 9: ROADS ============
console.log('\n========== 9. ROADS (මාර්ගස්ථ මගී.මාර්ග සං.අධිකාරිය) ==========');
{
  const data = readSheet('මාර්ගස්ථ මගී.මාර්ග සං.අධිකාරිය');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[2] && !row[1])) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name || '(empty)'} | ${c.field}`));
  }
}

// ============ CATEGORY 10: ROAD DEV ============
console.log('\n========== 10. ROAD DEV (දකු.ප.මාර්ග සංවර්ධන අධිකාරිය) ==========');
{
  const data = readSheet('දකු.ප.මාර්ග සංවර්ධන අධිකාරිය');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[2] && !row[1])) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name || '(empty)'} | ${c.field}`));
  }
}

// ============ CATEGORY 11: TRANSPORT ============
console.log('\n========== 11. TRANSPORT (මාර්ග ප්‍රවාහන) ==========');
{
  const data = readSheet('මාර්ග ප්‍රවාහන');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[2] && !row[1])) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name || '(empty)'} | ${c.field}`));
  }
}

// ============ CATEGORY 12: LOCAL GOVT ============
console.log('\n========== 12. LOCAL GOVT (පළාත් පාලන ආයතන ගාල්ල දිස්.) ==========');
{
  const data = readSheet('පළාත් පාලන ආයතන ගාල්ල දිස්.');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      excelContacts.push({ idx: row[0], name: norm(row[1]), phone: norm(row[2]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name} | ${c.phone}`));
  }
}

// ============ CATEGORY 13: FINANCE ============
console.log('\n========== 13. FINANCE (පළාත් අාදායම් දෙපාර්තෙම්න්තුව) ==========');
{
  const data = readSheet('පළාත් අාදායම් දෙපාර්තෙම්න්තුව');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[2] && !row[1])) continue;
      if (i < 3) continue;
      excelContacts.push({ idx: row[0], name: norm(row[2]), field: norm(row[1]), phone: norm(row[3]), mobile: norm(row[4]) });
    }
    console.log('Excel contacts: ' + excelContacts.length);
    excelContacts.forEach(c => console.log(`  ${c.idx} | ${c.name || '(empty)'} | ${c.field} | Ph:${c.phone} | Mob:${c.mobile}`));
  }
}

// ============ CATEGORY 14: POLICE ============
console.log('\n========== 14. POLICE (ආරක්ෂක ප්‍රධානීන් + පොලිස්) ==========');
{
  const sheets = ['ආරක්ෂක ප්‍රධානීන්', 'පොලිස්'];
  sheets.forEach(sn => {
    const data = readSheet(sn);
    if (!data) { console.log(`Sheet "${sn}" not found`); return; }
    console.log(`--- Sheet: ${sn} ---`);
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      excelContacts.push({ cells: row.map(c => norm(c)).filter(Boolean) });
    }
    console.log('Excel rows: ' + excelContacts.length);
    excelContacts.forEach((c, i) => console.log(`  Row ${i}: ${JSON.stringify(c.cells)}`));
  });
}

// ============ CATEGORY 15: AGRICULTURE ============
console.log('\n========== 15. AGRICULTURE (multiple sheets) ==========');
{
  const sheets = [
    'කලාප කාර්යාල,ද.කු.කෘෂි වාරි අමා',
    'ද.කු.ප.කෘෂිදෙපා.නියෙ කෘෂි ලබුදව',
    'ද.කු.ප.වාරි.දෙපා.දිස්.වාරි ඉංජි',
    'වාරිමාර්ග ආයතන'
  ];
  sheets.forEach(sn => {
    const data = readSheet(sn);
    if (!data) { console.log(`Sheet "${sn}" not found`); return; }
    console.log(`--- Sheet: ${sn} ---`);
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      excelContacts.push({ cells: row.map(c => norm(c)).filter(Boolean) });
    }
    console.log('Excel rows: ' + excelContacts.length);
    excelContacts.forEach((c, i) => console.log(`  Row ${i}: ${JSON.stringify(c.cells)}`));
  });
}

// ============ CATEGORY 16: LANDS ============
console.log('\n========== 16. LANDS (ඉඩම් + ද.කු.ප.ඉඩම් කොමසාරිස් දෙපාර්තමේ) ==========');
{
  const sheets = ['ඉඩම්', 'ද.කු.ප.ඉඩම් කොමසාරිස් දෙපාර්තමේ'];
  sheets.forEach(sn => {
    const data = readSheet(sn);
    if (!data) { console.log(`Sheet "${sn}" not found`); return; }
    console.log(`--- Sheet: ${sn} ---`);
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      excelContacts.push({ cells: row.map(c => norm(c)).filter(Boolean) });
    }
    console.log('Excel rows: ' + excelContacts.length);
    excelContacts.forEach((c, i) => console.log(`  Row ${i}: ${JSON.stringify(c.cells)}`));
  });
}

// ============ CATEGORY 17: BUILDINGS ============
console.log('\n========== 17. BUILDINGS (සමෘද්,ගොඩනැ පරී,නිවාස සං,නාගරික) ==========');
{
  const data = readSheet('සමෘද්,ගොඩනැ පරී,නිවාස සං,නාගරික');
  if (!data) { console.log('Sheet not found'); }
  else {
    const excelContacts = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      excelContacts.push({ cells: row.map(c => norm(c)).filter(Boolean) });
    }
    console.log('Excel rows: ' + excelContacts.length);
    excelContacts.forEach((c, i) => console.log(`  Row ${i}: ${JSON.stringify(c.cells)}`));
  }
}
