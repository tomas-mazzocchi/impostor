// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Session } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from '$lib/supabase/server';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: TypedSupabaseClient;
			getSession(): Promise<Session | null>;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
