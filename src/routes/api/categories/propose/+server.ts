import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { name, description } = body;

		if (!name || typeof name !== 'string') {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		const { data, error } = await locals.supabase
			.from('categories')
			.insert({
				name,
				description: description || null,
				approved: false,
				created_by: session.user.id
			})
			.select()
			.single();

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ category: data }, { status: 201 });
	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
