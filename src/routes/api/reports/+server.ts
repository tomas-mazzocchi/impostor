import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { type, entity_id, reason } = body;

		if (!type || !entity_id || !reason) {
			return json({ error: 'type, entity_id, and reason are required' }, { status: 400 });
		}

		if (type !== 'category' && type !== 'word') {
			return json({ error: 'type must be "category" or "word"' }, { status: 400 });
		}

		const { data, error } = await locals.supabase
			.from('reports')
			.insert({
				type,
				entity_id,
				reason,
				user_id: session.user.id
			})
			.select()
			.single();

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ report: data }, { status: 201 });
	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
