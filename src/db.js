const STORAGE_KEY = 'task_manager_tasks';

function getStoredTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading tasks from localStorage:', e);
    return [];
  }
}

function saveStoredTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks to localStorage:', e);
  }
}

export function getTasks() {
  return getStoredTasks();
}

export function getTask(id) {
  const tasks = getStoredTasks();
  return tasks.find(task => task.id === id);
}

export function createTask(title, description = '', type = 'default') {
  const tasks = getStoredTasks();
  const newTask = {
    id: Date.now(),
    title,
    description,
    status: 'pending',
    type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  tasks.push(newTask);
  saveStoredTasks(tasks);
  return newTask;
}

export function updateTask(id, updates) {
  const tasks = getStoredTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveStoredTasks(tasks);
    return tasks[index];
  }
  return null;
}

export function deleteTask(id) {
  let tasks = getStoredTasks();
  tasks = tasks.filter(task => task.id !== id);
  saveStoredTasks(tasks);
  return { changes: 1 };
}

export function updateTaskStatus(id, status) {
  return updateTask(id, { status });
}

export function deleteDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  return { changes: 1 };
}

export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  deleteDemoData
};
