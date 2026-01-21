import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbDir = join(__dirname, '..');
const dbPath = join(dbDir, 'tasks.db');

console.log('Expected DB path:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
  console.log('Tables:', tables);
  
  if (tables.find(t => t.name === 'tasks')) {
    const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
    console.log('Columns:', columns.map(c => c.name));
  }
  db.close();
} catch (e) {
  console.error('Error:', e.message);
}
