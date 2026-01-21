import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../tasks.db');

const db = new Database(dbPath);

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN acceptance_criteria TEXT DEFAULT '[]'`);
  console.log('Added acceptance_criteria column');
} catch (e) {
  console.log('acceptance_criteria column might already exist');
}

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'`);
  console.log('Added tags column');
} catch (e) {
  console.log('tags column might already exist');
}

const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
console.log('Current columns:', columns.map(c => c.name));

db.close();
