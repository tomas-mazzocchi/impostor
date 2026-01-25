import type { GameState, Player, Category, Word, PlayerRole, RoundResult } from './types';

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

function findCategoryByWord(categories: Category[], word: Word): Category | null {
	return categories.find((c) => c.id === word.categoryId) || null;
}

export function startGame(
	state: GameState,
	allWords: Word[],
	categories: Category[]
): GameState {
	if (state.players.length < 3) {
		throw new Error('Need at least 3 players');
	}
	if (allWords.length === 0) {
		throw new Error('No words available');
	}
	if (categories.length === 0) {
		throw new Error('No categories available');
	}

	// Pick a random word from ALL words first
	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];

	// Find the category that matches the word's categoryId
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	const impostorIndex = Math.floor(Math.random() * state.players.length);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);

	// Pick one word for all regular players
	const regularPlayerWord = selectedWord.word;

	const playersWithWords = state.players.map((player, index) => {
		const role: PlayerRole = index === impostorIndex ? 'impostor' : 'regular';
		const word = role === 'impostor' ? null : regularPlayerWord;
		return { ...player, role, word };
	});

	return {
		...state,
		phase: 'reveal',
		category,
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

export function reshuffleWord(
	state: GameState,
	categories: Category[],
	allWords: Word[]
): GameState {
	if (state.phase !== 'reveal') {
		throw new Error('Can only reshuffle word during reveal phase');
	}
	if (categories.length === 0) {
		throw new Error('No categories available');
	}
	if (allWords.length === 0) {
		throw new Error('No words available');
	}

	// Pick a random word from ALL words first
	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];

	// Find the category that matches the word's categoryId
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	// Ensure impostor changes (if there are multiple players)
	let impostorIndex: number;
	do {
		impostorIndex = Math.floor(Math.random() * state.players.length);
	} while (impostorIndex === state.impostorIndex && state.players.length > 1);

	// Ensure starting player changes (if there are multiple players)
	let startingPlayerIndex: number;
	do {
		startingPlayerIndex = Math.floor(Math.random() * state.players.length);
	} while (startingPlayerIndex === state.currentPlayerIndex && state.players.length > 1);

	// Pick one word for all regular players
	const regularPlayerWord = selectedWord.word;

	const playersWithWords = state.players.map((player, index) => {
		const role: PlayerRole = index === impostorIndex ? 'impostor' : 'regular';
		const word = role === 'impostor' ? null : regularPlayerWord;
		return { ...player, role, word };
	});

	return {
		...state,
		category,
		players: playersWithWords,
		words: shuffledWords,
		impostorIndex,
		currentPlayerIndex: startingPlayerIndex
		// Keep roundNumber unchanged
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
	// Voting phase is no longer used, but keeping function for backward compatibility
	return {
		...state,
		phase: 'roundResults'
	};
}

export function endGame(state: GameState, winner: 'impostor' | 'players'): GameState {
	// Results phase renamed to finalResults, but keeping function for backward compatibility
	return {
		...state,
		phase: 'finalResults',
		winner
	};
}

export function showRoundResults(state: GameState): GameState {
	return {
		...state,
		phase: 'roundResults'
	};
}

export function recordRoundScores(state: GameState, roundResult: RoundResult): GameState {
	const { impostorExpelled, expellers, roundsSurvived, impostorGuessedWord } = roundResult;

	const updatedPlayers = state.players.map((player) => {
		let scoreIncrease = 0;

		if (player.role === 'impostor') {
			// Impostor always gets +1 per round survived
			scoreIncrease += roundsSurvived;

			if (!impostorExpelled) {
				// +5 if wins by not being discovered
				scoreIncrease += 5;
			} else if (impostorGuessedWord) {
				// +3 if expelled but guessed the word
				scoreIncrease += 3;
			}
		} else if (player.role === 'regular') {
			if (impostorExpelled) {
				// All regular players get +2 if impostor was expelled
				scoreIncrease += 2;

				// Additional +1 if this player voted to expel
				if (expellers.includes(player.id)) {
					scoreIncrease += 1;
				}
			}
		}

		return { ...player, score: player.score + scoreIncrease };
	});

	return {
		...state,
		players: updatedPlayers,
		winner: impostorExpelled ? 'players' : 'impostor'
	};
}

export function startNextRound(
	state: GameState,
	allWords: Word[],
	categories: Category[]
): GameState {
	if (allWords.length === 0) {
		throw new Error('No words available');
	}
	if (categories.length === 0) {
		throw new Error('No categories available');
	}

	// Pick a random word from ALL words first
	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];

	// Find the category that matches the word's categoryId
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	const impostorIndex = Math.floor(Math.random() * state.players.length);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);

	// Pick one word for all regular players
	const regularPlayerWord = selectedWord.word;

	const playersWithWords = state.players.map((player, index) => {
		const role: PlayerRole = index === impostorIndex ? 'impostor' : 'regular';
		const word = role === 'impostor' ? null : regularPlayerWord;
		return { ...player, role, word };
	});

	return {
		...state,
		phase: 'reveal',
		category,
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
