import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const categoryId = params.id;

	try {
		const { data, error } = await locals.supabase
			.from('words')
			.select('*')
			.eq('category_id', categoryId)
			.eq('approved', true)
			.order('word');

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ words: data });
	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
