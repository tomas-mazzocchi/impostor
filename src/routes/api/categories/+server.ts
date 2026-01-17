import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { data, error } = await locals.supabase
			.from('categories')
			.select('*')
			.eq('approved', true)
			.order('name');

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ categories: data });
	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
