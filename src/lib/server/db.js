import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const dbPath = join(__dirname, 'tasks.db');

console.log('Database path:', dbPath);

let db;

function initDb() {
  try {
    db = new Database(dbPath);
    console.log('Database opened:', dbPath);
  } catch (e) {
    console.error('Failed to open database:', e);
    throw e;
  }
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'default',
      status TEXT DEFAULT 'pending',
      acceptance_criteria TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  
  const check = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  console.log('Tasks in database:', check.count);
  
  if (check.count === 0) {
    seedDemoData();
  }
  
  return db;
}

function getDb() {
  if (!db) {
    return initDb();
  }
  return db;
}

function seedDemoData() {
  const stmt = getDb().prepare('SELECT COUNT(*) as count FROM tasks');
  const result = stmt.get();
  
  if (result.count === 0) {
    console.log('Seeding demo data...');
    const demoTasks = [
      { id: '1', title: 'Fix authentication bug', type: 'bug' },
      { id: '2', title: 'Implement user dashboard', type: 'feature' },
      { id: '3', title: 'Refactor API', type: 'refactor' },
      { id: '4', title: 'Write unit tests', type: 'test' },
      { id: '5', title: 'Deploy staging', type: 'deploy' },
      { id: '6', title: 'Code review', type: 'review' },
      { id: '7', title: 'Update docs', type: 'docs' },
      { id: '8', title: 'Database migration', type: 'database' },
      { id: '9', title: 'Performance optimization', type: 'optimization' }
    ];
    
    const insert = getDb().prepare(`
      INSERT INTO tasks (id, title, type, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `);
    
    const insertMany = getDb().transaction((tasks) => {
      for (const task of tasks) {
        insert.run(task.id, task.title, task.type);
      }
    });
    
    insertMany(demoTasks);
    console.log('Seeded 9 demo tasks');
  }
}

export function getTasks() {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY id ASC');
    const tasks = stmt.all();
    
    return tasks;
  } catch (error) {
    console.error('Error in getTasks:', error);
    throw error;
  }
}

export function getTask(id) {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return task;
}

export function getDistinctTags() {
  try {
    const stmt = getDb().prepare('SELECT tags FROM tasks WHERE tags IS NOT NULL AND tags != \'\'');
    const tasks = stmt.all();
    const allTags = new Set();
    
    for (const task of tasks) {
      try {
        const tags = JSON.parse(task.tags);
        if (Array.isArray(tags)) {
          tags.forEach(tag => allTags.add(tag));
        }
      } catch (e) {
        console.error('Error parsing tags for task:', task.id, e);
      }
    }
    
    return Array.from(allTags).sort();
  } catch (e) {
    console.error('Error in getDistinctTags:', e);
    return [];
  }
}

export function createTask(title, description = '', type = 'default', acceptance_criteria = [], tags = []) {
  const id = Date.now().toString();
  const stmt = getDb().prepare(`
    INSERT INTO tasks (id, title, description, type, status, acceptance_criteria, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now'))
  `);
  
  stmt.run(id, title, description, type, JSON.stringify(acceptance_criteria || []), JSON.stringify(tags || []));
  
  return getTask(id);
}

export function updateTask(id, updates) {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  
  if (fields.length === 0) return null;
  
  fields.push("updated_at = datetime('now')");
  values.push(id);
  
  const stmt = getDb().prepare(`
    UPDATE tasks SET ${fields.join(', ')} WHERE id = ?
  `);
  
  stmt.run(...values);
  
  return getTask(id);
}

export function deleteTask(id) {
  const stmt = getDb().prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  return { changes: result.changes };
}

export function updateTaskStatus(id, status) {
  return updateTask(id, { status });
}

export function clearAllTasks() {
  const stmt = getDb().prepare('DELETE FROM tasks');
  const result = stmt.run();
  return { changes: result.changes };
}

getDb();
