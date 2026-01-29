import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './database.types';

type CookieToSet = { name: string; value: string; options: CookieOptions };

function buildCookieHandler(event: RequestEvent) {
	return {
		getAll: () => event.cookies.getAll(),
		setAll: (cookiesToSet: CookieToSet[]) => {
			cookiesToSet.forEach(({ name, value, options }) => {
				event.cookies.set(name, value, options);
			});
		}
	};
}

export function createClient(event: RequestEvent) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{ cookies: buildCookieHandler(event) }
	);
}

export type TypedSupabaseClient = ReturnType<typeof createClient>;
