import Database from 'better-sqlite3';

const db = new Database('E:/tasks.db');

try {
  const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
  console.log('Columns in tasks table:');
  columns.forEach(c => console.log(`  - ${c.name}: ${c.type}`));
  
  const tasks = db.prepare(`SELECT * FROM tasks LIMIT 1`).all();
  console.log('\nSample task:', tasks[0]);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  db.close();
}
