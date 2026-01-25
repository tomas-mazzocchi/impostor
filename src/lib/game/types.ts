export type PlayerRole = 'regular' | 'impostor';

export interface Player {
	id: string;
	name: string;
	role: PlayerRole;
	word: string | null;
	score: number;
}

export interface Category {
	id: string;
	name: string;
	description?: string;
}

export interface Word {
	id: string;
	word: string;
	categoryId: string;
}

export type GamePhase = 'setup' | 'reveal' | 'playing' | 'roundResults' | 'finalResults';

export interface RoundResult {
	impostorExpelled: boolean;
	expellers: string[];
	roundsSurvived: number;
	impostorGuessedWord: boolean;
}

export interface GameState {
	phase: GamePhase;
	players: Player[];
	category: Category | null;
	words: Word[];
	currentPlayerIndex: number;
	impostorIndex: number;
	accusations: Record<string, string>;
	winner: 'impostor' | 'players' | null;
	roundNumber: number;
}
