import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { category_id, word } = body;

		if (!category_id || !word) {
			return json({ error: 'category_id and word are required' }, { status: 400 });
		}

		const { data, error } = await locals.supabase
			.from('words')
			.insert({
				category_id,
				word,
				approved: false,
				created_by: session.user.id
			})
			.select()
			.single();

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ word: data }, { status: 201 });
	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
