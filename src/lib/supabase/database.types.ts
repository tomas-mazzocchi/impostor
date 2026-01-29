export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			categories: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					created_at: string;
					approved: boolean;
					created_by: string | null;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					created_at?: string;
					approved?: boolean;
					created_by?: string | null;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					created_at?: string;
					approved?: boolean;
					created_by?: string | null;
				};
				Relationships: [];
			};
			words: {
				Row: {
					id: string;
					category_id: string;
					word: string;
					created_at: string;
					approved: boolean;
					created_by: string | null;
				};
				Insert: {
					id?: string;
					category_id: string;
					word: string;
					created_at?: string;
					approved?: boolean;
					created_by?: string | null;
				};
				Update: {
					id?: string;
					category_id?: string;
					word?: string;
					created_at?: string;
					approved?: boolean;
					created_by?: string | null;
				};
				Relationships: [];
			};
			reports: {
				Row: {
					id: string;
					type: 'category' | 'word';
					entity_id: string;
					reason: string;
					user_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					type: 'category' | 'word';
					entity_id: string;
					reason: string;
					user_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					type?: 'category' | 'word';
					entity_id?: string;
					reason?: string;
					user_id?: string | null;
					created_at?: string;
				};
				Relationships: [];
			};
			user_roles: {
				Row: {
					user_id: string;
					role: 'admin' | 'moderator';
					created_at: string;
				};
				Insert: {
					user_id: string;
					role: 'admin' | 'moderator';
					created_at?: string;
				};
				Update: {
					user_id?: string;
					role?: 'admin' | 'moderator';
					created_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
