import { json } from '@sveltejs/kit';
import { getDistinctTags } from '$lib/server/db.js';

export async function GET() {
  try {
    const tags = getDistinctTags();
    return json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
