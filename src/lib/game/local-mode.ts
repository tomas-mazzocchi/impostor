import type { GameState, Player, Category, Word, PlayerRole, RoundResult } from './types';

export function createInitialState(): GameState {
	return {
		phase: 'setup',
		players: [],
		category: null,
		words: [],
		currentPlayerIndex: 0,
		impostorIndex: -1,
		impostorCount: 1,
		accusations: {},
		winner: null,
		roundNumber: 0
	};
}

function pickRandomIndices(count: number, maxExclusive: number): number[] {
	const indices = Array.from({ length: maxExclusive }, (_, i) => i);
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	return indices.slice(0, count);
}

function assignRolesFromImpostorIndices(
	players: Player[],
	impostorIndices: number[],
	regularPlayerWord: string
): { playersWithWords: Player[]; firstImpostorIndex: number } {
	const impostorSet = new Set(impostorIndices);
	const firstImpostorIndex = impostorIndices[0] ?? -1;
	const playersWithWords = players.map((player, index) => {
		const role: PlayerRole = impostorSet.has(index) ? 'impostor' : 'regular';
		const word = role === 'impostor' ? null : regularPlayerWord;
		return { ...player, role, word };
	});
	return { playersWithWords, firstImpostorIndex };
}

export function resetGameWithSamePlayers(
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

	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	const count = clampImpostorCount(state.impostorCount ?? 1, state.players.length);
	const impostorIndices = pickRandomIndices(count, state.players.length);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);
	const { playersWithWords, firstImpostorIndex } = assignRolesFromImpostorIndices(
		state.players,
		impostorIndices,
		selectedWord.word
	);

	return {
		...state,
		phase: 'reveal',
		category,
		players: playersWithWords.map((p) => ({ ...p, score: 0 })),
		words: shuffledWords,
		impostorIndex: firstImpostorIndex,
		impostorCount: count,
		currentPlayerIndex: startingPlayerIndex,
		roundNumber: 1,
		accusations: {},
		winner: null
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

function clampImpostorCount(count: number, playerCount: number): number {
	const max = Math.max(1, playerCount - 1);
	return Math.min(max, Math.max(1, Math.floor(Number(count)) || 1));
}

export function startGame(
	state: GameState,
	allWords: Word[],
	categories: Category[],
	impostorCount: number = 1
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

	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	const count = clampImpostorCount(impostorCount, state.players.length);
	const impostorIndices = pickRandomIndices(count, state.players.length);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);
	const { playersWithWords, firstImpostorIndex } = assignRolesFromImpostorIndices(
		state.players,
		impostorIndices,
		selectedWord.word
	);

	return {
		...state,
		phase: 'reveal',
		category,
		players: playersWithWords,
		words: shuffledWords,
		impostorIndex: firstImpostorIndex,
		impostorCount: count,
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

	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	const count = clampImpostorCount(state.impostorCount ?? 1, state.players.length);
	let impostorIndices = pickRandomIndices(count, state.players.length);
	if (count === 1 && state.players.length > 1) {
		while (impostorIndices[0] === state.impostorIndex) {
			impostorIndices = pickRandomIndices(1, state.players.length);
		}
	}
	let startingPlayerIndex = Math.floor(Math.random() * state.players.length);
	if (state.players.length > 1 && startingPlayerIndex === state.currentPlayerIndex) {
		startingPlayerIndex = (startingPlayerIndex + 1) % state.players.length;
	}
	const { playersWithWords, firstImpostorIndex } = assignRolesFromImpostorIndices(
		state.players,
		impostorIndices,
		selectedWord.word
	);

	return {
		...state,
		category,
		players: playersWithWords,
		words: shuffledWords,
		impostorIndex: firstImpostorIndex,
		currentPlayerIndex: startingPlayerIndex
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
			// +2 if expelled but guessed the word
			scoreIncrease += 2;
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

	const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
	const selectedWord = shuffledWords[0];
	const category = findCategoryByWord(categories, selectedWord);
	if (!category) {
		throw new Error(`No category found for word: ${selectedWord.word}`);
	}

	const count = clampImpostorCount(state.impostorCount ?? 1, state.players.length);
	const impostorIndices = pickRandomIndices(count, state.players.length);
	const startingPlayerIndex = Math.floor(Math.random() * state.players.length);
	const { playersWithWords, firstImpostorIndex } = assignRolesFromImpostorIndices(
		state.players,
		impostorIndices,
		selectedWord.word
	);

	return {
		...state,
		phase: 'reveal',
		category,
		players: playersWithWords,
		words: shuffledWords,
		impostorIndex: firstImpostorIndex,
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
