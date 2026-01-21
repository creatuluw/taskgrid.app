import { json } from '@sveltejs/kit';
import { deleteTask } from '$lib/server/db.js';

export async function DELETE({ params }) {
  try {
    const { id } = params;
    const result = deleteTask(id);
    
    if (result.changes === 0) {
      return json({ error: 'Task not found' }, { status: 404 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
