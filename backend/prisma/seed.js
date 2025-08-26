const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// Absolute path to your CSV
const DATA_PATH = path.resolve(__dirname, 'Mastersheet_1 - Sheet1.csv');
console.log('Reading CSV from:', DATA_PATH);

function parseDate(s) {
  if (!s) return null;
  // handles YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s);
  // handles DD/MM/YYYY
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

async function main() {
  const rows = [];

  // 1) Load the CSV into memory
  await new Promise((resolve, reject) => {
    fs.createReadStream(DATA_PATH)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Loaded ${rows.length} rows from CSV`);

  // 2) Map rows to your Prisma model shape
  const mapped = rows.map((r) => ({
    date: parseDate(r['Date']) || new Date(),
    work_mode: r['Work Mode'] || '',
    project_name: r['Project Name'] || null,
    task_name: r['Task Name'] || null,
    book_element: r['Book Element'] || null,
    chapter_number: r['Chapter Number'] || null,
    hours_spent: r['Hours Spent'] ? parseFloat(r['Hours Spent']) : 0,
    number_of_units: r['Number of Units'] ? parseInt(r['Number of Units'], 10) : null,
    unit_type: r['Unit type'] || null,
    status: r['Status'] || null,
    due_on: parseDate(r['Due on']),
    details: r['Details'] || null,
    name: r['Name'] || '',
    team: r['Team'] || '',
  }));

  // 3) Insert in batches for speed
  const BATCH = 1000;
  for (let i = 0; i < mapped.length; i += BATCH) {
    const chunk = mapped.slice(i, i + BATCH);
    console.log(`Inserting rows ${i + 1}–${i + chunk.length}...`);
    await prisma.masterDatabase.createMany({
      data: chunk,
      skipDuplicates: false, // set true if you want to ignore unique conflicts
    });
  }

  console.log('Seeding complete.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
