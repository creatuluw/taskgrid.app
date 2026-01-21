import Database from 'better-sqlite3';

const db = new Database('src/lib/tasks.db');

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN acceptance_criteria TEXT DEFAULT '[]'`);
  console.log('✓ Added acceptance_criteria column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ acceptance_criteria column already exists');
  } else {
    console.error('Error adding acceptance_criteria:', e.message);
  }
}

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'`);
  console.log('✓ Added tags column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ tags column already exists');
  } else {
    console.error('Error adding tags:', e.message);
  }
}

const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
console.log('\nUpdated schema:');
columns.forEach(c => console.log(`  ${c.name}: ${c.type}`));

db.close();
