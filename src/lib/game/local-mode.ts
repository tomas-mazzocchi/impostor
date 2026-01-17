import type { GameState, Player, Category, Word, PlayerRole } from './types';

export function createInitialState(): GameState {
	return {
		phase: 'setup',
		players: [],
		category: null,
		words: [],
		currentPlayerIndex: 0,
		impostorIndex: -1,
		accusations: {},
		winner: null,
		roundNumber: 0
	};
}

export function addPlayer(state: GameState, name: string): GameState {
	const newPlayer: Player = {
		id: crypto.randomUUID(),
		name: name.trim(),
		role: 'regular',
		word: null,
		score: 0
	};
	return {
		...state,
		players: [...state.players, newPlayer]
	};
}

export function removePlayer(state: GameState, playerId: string): GameState {
	return {
		...state,
		players: state.players.filter((p) => p.id !== playerId)
	};
}

export function selectCategory(state: GameState, category: Category): GameState {
	return {
		...state,
		category
	};
}

export function startGame(
	state: GameState,
	words: Word[]
): GameState {
	if (state.players.length < 3) {
		throw new Error('Need at least 3 players');
	}
	if (!state.category) {
		throw new Error('Category must be selected');
	}
	if (words.length < state.players.length) {
		throw new Error('Not enough words for all players');
	}

	const impostorIndex = Math.floor(Math.random() * state.players.length);
	const shuffledWords = [...words].sort(() => Math.random() - 0.5);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);

	// Pick one word for all regular players
	const regularPlayerWord = shuffledWords[0].word;

	const playersWithWords = state.players.map((player, index) => {
		const role: PlayerRole = index === impostorIndex ? 'impostor' : 'regular';
		const word = role === 'impostor' ? null : regularPlayerWord;
		return { ...player, role, word };
	});

	return {
		...state,
		phase: 'reveal',
		players: playersWithWords,
		words: shuffledWords,
		impostorIndex,
		currentPlayerIndex: startingPlayerIndex,
		roundNumber: state.roundNumber + 1
	};
}

export function moveToPlayingPhase(state: GameState): GameState {
	if (state.phase !== 'reveal') {
		throw new Error('Can only move to playing phase from reveal');
	}
	return {
		...state,
		phase: 'playing'
	};
}

export function addAccusation(
	state: GameState,
	accuserId: string,
	accusedId: string
): GameState {
	return {
		...state,
		accusations: {
			...state.accusations,
			[accuserId]: accusedId
		}
	};
}

export function startVoting(state: GameState): GameState {
	return {
		...state,
		phase: 'voting'
	};
}

export function endGame(state: GameState, winner: 'impostor' | 'players'): GameState {
	return {
		...state,
		phase: 'results',
		winner
	};
}

export function showRoundResults(state: GameState): GameState {
	return {
		...state,
		phase: 'roundResults'
	};
}

export function recordRoundWinner(
	state: GameState,
	winner: 'impostor' | 'players'
): GameState {
	const updatedPlayers = state.players.map((player) => {
		if (winner === 'impostor' && player.role === 'impostor') {
			return { ...player, score: player.score + 1 };
		} else if (winner === 'players' && player.role === 'regular') {
			return { ...player, score: player.score + 1 };
		}
		return player;
	});

	return {
		...state,
		players: updatedPlayers,
		winner
	};
}

export function startNextRound(state: GameState, words: Word[]): GameState {
	if (!state.category) {
		throw new Error('Category must be selected');
	}
	if (words.length < state.players.length) {
		throw new Error('Not enough words for all players');
	}

	const impostorIndex = Math.floor(Math.random() * state.players.length);
	const shuffledWords = [...words].sort(() => Math.random() - 0.5);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);

	// Pick one word for all regular players
	const regularPlayerWord = shuffledWords[0].word;

	const playersWithWords = state.players.map((player, index) => {
		const role: PlayerRole = index === impostorIndex ? 'impostor' : 'regular';
		const word = role === 'impostor' ? null : regularPlayerWord;
		return { ...player, role, word };
	});

	return {
		...state,
		phase: 'reveal',
		players: playersWithWords,
		words: shuffledWords,
		impostorIndex,
		currentPlayerIndex: startingPlayerIndex,
		roundNumber: state.roundNumber + 1,
		accusations: {},
		winner: null
	};
}

export function showFinalResults(state: GameState): GameState {
	return {
		...state,
		phase: 'finalResults'
	};
}

export function getPlayersByScore(state: GameState): Player[] {
	return [...state.players].sort((a, b) => b.score - a.score);
}

export function getPlayerById(state: GameState, playerId: string): Player | undefined {
	return state.players.find((p) => p.id === playerId);
}

export function getImpostor(state: GameState): Player | undefined {
	return state.players[state.impostorIndex];
}
