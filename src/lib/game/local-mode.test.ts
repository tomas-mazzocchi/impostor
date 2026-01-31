import { describe, it, expect, beforeEach } from 'vitest';
import type { GameState, Category, Word, Player } from './types';
import {
	createInitialState,
	addPlayer,
	startGame,
	reshuffleWord,
	startNextRound,
	recordRoundScores,
	getImpostor
} from './local-mode';

function createTestCategories(): Category[] {
	return [{ id: 'cat-1', name: 'Animals' }];
}

function createTestWords(): Word[] {
	return [{ id: 'word-1', word: 'Dog', categoryId: 'cat-1' }];
}

function createStateWithPlayers(count: number): GameState {
	let state = createInitialState();
	for (let i = 0; i < count; i++) {
		state = addPlayer(state, `Player ${i + 1}`);
	}
	return state;
}

describe('startGame', () => {
	it('Assigns exactly one impostor among all players', () => {
		const state = createStateWithPlayers(4);
		const categories = createTestCategories();
		const words = createTestWords();

		const result = startGame(state, words, categories);

		const impostors = result.players.filter(p => p.role === 'impostor');
		const regulars = result.players.filter(p => p.role === 'regular');

		expect(impostors).toHaveLength(1);
		expect(regulars).toHaveLength(3);
	});

	it('Assigns word to regular players only', () => {
		const state = createStateWithPlayers(4);
		const categories = createTestCategories();
		const words = createTestWords();

		const result = startGame(state, words, categories);

		const impostor = result.players.find(p => p.role === 'impostor');
		const regulars = result.players.filter(p => p.role === 'regular');

		expect(impostor?.word).toBeNull();
		regulars.forEach(player => {
			expect(player.word).toBe('Dog');
		});
	});

	it('Sets impostorIndex correctly matching the impostor player', () => {
		const state = createStateWithPlayers(4);
		const categories = createTestCategories();
		const words = createTestWords();

		const result = startGame(state, words, categories);

		const impostorByIndex = result.players[result.impostorIndex];
		expect(impostorByIndex.role).toBe('impostor');
	});

	it('Throws error when less than 3 players', () => {
		const state = createStateWithPlayers(2);
		const categories = createTestCategories();
		const words = createTestWords();

		expect(() => startGame(state, words, categories)).toThrow('Need at least 3 players');
	});

	it('Changes phase to reveal', () => {
		const state = createStateWithPlayers(3);
		const categories = createTestCategories();
		const words = createTestWords();

		const result = startGame(state, words, categories);

		expect(result.phase).toBe('reveal');
	});
});

describe('reshuffleWord', () => {
	let initialGameState: GameState;
	let categories: Category[];
	let words: Word[];

	beforeEach(() => {
		const setupState = createStateWithPlayers(4);
		categories = createTestCategories();
		words = createTestWords();
		initialGameState = startGame(setupState, words, categories);
	});

	it('Changes the impostor to a different player', () => {
		const originalImpostorIndex = initialGameState.impostorIndex;

		const result = reshuffleWord(initialGameState, categories, words);

		expect(result.impostorIndex).not.toBe(originalImpostorIndex);
	});

	it('Assigns new roles correctly after reshuffle', () => {
		const result = reshuffleWord(initialGameState, categories, words);

		const impostors = result.players.filter(p => p.role === 'impostor');
		const regulars = result.players.filter(p => p.role === 'regular');

		expect(impostors).toHaveLength(1);
		expect(regulars).toHaveLength(3);
	});

	it('Keeps impostorIndex in sync with player roles', () => {
		const result = reshuffleWord(initialGameState, categories, words);

		const impostorByIndex = result.players[result.impostorIndex];
		const impostorByRole = result.players.find(p => p.role === 'impostor');

		expect(impostorByIndex).toBe(impostorByRole);
	});

	it('Keeps roundNumber unchanged', () => {
		const originalRoundNumber = initialGameState.roundNumber;

		const result = reshuffleWord(initialGameState, categories, words);

		expect(result.roundNumber).toBe(originalRoundNumber);
	});

	it('Assigns word only to regular players after reshuffle', () => {
		const result = reshuffleWord(initialGameState, categories, words);

		const impostor = result.players.find(p => p.role === 'impostor');
		const regulars = result.players.filter(p => p.role === 'regular');

		expect(impostor?.word).toBeNull();
		regulars.forEach(player => {
			expect(player.word).not.toBeNull();
		});
	});
});

describe('startNextRound', () => {
	let previousRoundState: GameState;
	let categories: Category[];
	let words: Word[];

	beforeEach(() => {
		const setupState = createStateWithPlayers(4);
		categories = createTestCategories();
		words = createTestWords();
		previousRoundState = startGame(setupState, words, categories);
	});

	it('Assigns exactly one impostor in the new round', () => {
		const result = startNextRound(previousRoundState, words, categories);

		const impostors = result.players.filter(p => p.role === 'impostor');
		expect(impostors).toHaveLength(1);
	});

	it('Increments roundNumber', () => {
		const originalRoundNumber = previousRoundState.roundNumber;

		const result = startNextRound(previousRoundState, words, categories);

		expect(result.roundNumber).toBe(originalRoundNumber + 1);
	});

	it('Resets accusations for new round', () => {
		previousRoundState.accusations = { 'player-1': 'player-2' };

		const result = startNextRound(previousRoundState, words, categories);

		expect(result.accusations).toEqual({});
	});

	it('Keeps impostorIndex in sync with player roles', () => {
		const result = startNextRound(previousRoundState, words, categories);

		const impostorByIndex = result.players[result.impostorIndex];
		expect(impostorByIndex.role).toBe('impostor');
	});
});

describe('recordRoundScores', () => {
	let gameState: GameState;

	beforeEach(() => {
		const setupState = createStateWithPlayers(4);
		const categories = createTestCategories();
		const words = createTestWords();
		gameState = startGame(setupState, words, categories);
		gameState.players = gameState.players.map(p => ({ ...p, score: 0 }));
	});

	it('Gives impostor +5 when not expelled', () => {
		const impostor = getImpostor(gameState);

		const result = recordRoundScores(gameState, {
			impostorExpelled: false,
			expellers: [],
			roundsSurvived: 0,
			impostorGuessedWord: false
		});

		const updatedImpostor = result.players.find(p => p.id === impostor?.id);
		expect(updatedImpostor?.score).toBe(5);
	});

	it('Gives impostor +1 per round survived', () => {
		const impostor = getImpostor(gameState);

		const result = recordRoundScores(gameState, {
			impostorExpelled: true,
			expellers: [],
			roundsSurvived: 3,
			impostorGuessedWord: false
		});

		const updatedImpostor = result.players.find(p => p.id === impostor?.id);
		expect(updatedImpostor?.score).toBe(3);
	});

	it('Gives impostor +2 when expelled but guessed word', () => {
		const impostor = getImpostor(gameState);

		const result = recordRoundScores(gameState, {
			impostorExpelled: true,
			expellers: [],
			roundsSurvived: 0,
			impostorGuessedWord: true
		});

		const updatedImpostor = result.players.find(p => p.id === impostor?.id);
		expect(updatedImpostor?.score).toBe(2);
	});

	it('Gives regular players +2 when impostor expelled', () => {
		const regulars = gameState.players.filter(p => p.role === 'regular');

		const result = recordRoundScores(gameState, {
			impostorExpelled: true,
			expellers: [],
			roundsSurvived: 0,
			impostorGuessedWord: false
		});

		regulars.forEach(regular => {
			const updated = result.players.find(p => p.id === regular.id);
			expect(updated?.score).toBe(2);
		});
	});

	it('Gives expellers +3 total when they voted to expel impostor', () => {
		const regulars = gameState.players.filter(p => p.role === 'regular');
		const expellerId = regulars[0].id;

		const result = recordRoundScores(gameState, {
			impostorExpelled: true,
			expellers: [expellerId],
			roundsSurvived: 0,
			impostorGuessedWord: false
		});

		const expeller = result.players.find(p => p.id === expellerId);
		expect(expeller?.score).toBe(3);
	});

	it('Sets winner to players when impostor expelled', () => {
		const result = recordRoundScores(gameState, {
			impostorExpelled: true,
			expellers: [],
			roundsSurvived: 0,
			impostorGuessedWord: false
		});

		expect(result.winner).toBe('players');
	});

	it('Sets winner to impostor when not expelled', () => {
		const result = recordRoundScores(gameState, {
			impostorExpelled: false,
			expellers: [],
			roundsSurvived: 0,
			impostorGuessedWord: false
		});

		expect(result.winner).toBe('impostor');
	});
});

describe('getImpostor', () => {
	it('Returns the player at impostorIndex', () => {
		const setupState = createStateWithPlayers(4);
		const categories = createTestCategories();
		const words = createTestWords();
		const gameState = startGame(setupState, words, categories);

		const impostor = getImpostor(gameState);

		expect(impostor).toBe(gameState.players[gameState.impostorIndex]);
		expect(impostor?.role).toBe('impostor');
	});
});
