import Database from 'better-sqlite3';

try {
  const db = new Database('src/lib/tasks.db');
  const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
  console.log('Current schema:');
  columns.forEach(c => console.log(`  ${c.name}: ${c.type} (${c.notnull ? 'NOT NULL' : 'NULL'})`));
  
  db.close();
} catch (e) {
  console.error('Error:', e.message);
}
