import { json } from '@sveltejs/kit';
import { getTasks, createTask, deleteTask, getDistinctTags } from '$lib/server/db.js';

export async function GET({ url }) {
  try {
    console.log('Fetching tasks...');
    const tasks = getTasks();
    console.log('Tasks fetched:', tasks.length);
    const tags = getDistinctTags();
    console.log('Tags fetched:', tags);
    return json({ tasks, tags });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    console.error('Error stack:', error.stack);
    return json({ error: 'Failed to fetch tasks', details: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { title, description, type } = data;
    
    if (!title) {
      return json({ error: 'Title is required' }, { status: 400 });
    }
    
    const task = createTask(title, description || '', type || 'default');
    return json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
}
