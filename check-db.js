import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../tasks.db');

console.log('Database path:', dbPath);

const db = new Database(dbPath, { readonly: true });

try {
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
  console.log('Tables:', tables);

  if (tables.length > 0) {
    const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
    console.log('Columns:', columns.map(c => ({ name: c.name, type: c.type })));

    const tasks = db.prepare(`SELECT * FROM tasks LIMIT 3`).all();
    console.log('Sample tasks:', tasks);
  }
} catch (e) {
  console.error('Error:', e);
} finally {
  db.close();
}
