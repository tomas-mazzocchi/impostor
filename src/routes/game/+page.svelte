<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState, Category, Word } from '$lib/game/types';
	import {
		createInitialState,
		addPlayer,
		removePlayer,
		selectCategory,
		startGame,
		moveToPlayingPhase,
		addAccusation,
		startVoting,
		endGame,
		getPlayerById,
		recordRoundWinner,
		reverseRoundWinner,
		startNextRound,
		showFinalResults,
		reshuffleWord
	} from '$lib/game/local-mode';
	import SetupScreen from '$lib/components/SetupScreen.svelte';
	import RevealScreen from '$lib/components/RevealScreen.svelte';
	import GameScreen from '$lib/components/GameScreen.svelte';
	import VotingScreen from '$lib/components/VotingScreen.svelte';
	import ResultsScreen from '$lib/components/ResultsScreen.svelte';
	import FinalResultsScreen from '$lib/components/FinalResultsScreen.svelte';

	let gameState: GameState = createInitialState();
	let playerNameInput = '';
	let currentViewingPlayerId: string | null = null;
	let viewedPlayers: Set<string> = new Set();

	const sampleCategories: Category[] = [
		{ id: '1', name: 'Animals', description: 'Different types of animals' },
		{ id: '2', name: 'Food', description: 'Various food items' },
		{ id: '3', name: 'Countries', description: 'Countries around the world' }
	];

	const sampleWords: Word[] = [
		{ id: '1', word: 'Dog', categoryId: '1' },
		{ id: '2', word: 'Cat', categoryId: '1' },
		{ id: '3', word: 'Elephant', categoryId: '1' },
		{ id: '4', word: 'Lion', categoryId: '1' },
		{ id: '5', word: 'Pizza', categoryId: '2' },
		{ id: '6', word: 'Burger', categoryId: '2' },
		{ id: '7', word: 'Pasta', categoryId: '2' },
		{ id: '8', word: 'Sushi', categoryId: '2' }
	];

	function handleAddPlayer() {
		if (playerNameInput.trim()) {
			gameState = addPlayer(gameState, playerNameInput);
			playerNameInput = '';
		}
	}

	function handleRemovePlayer(playerId: string) {
		gameState = removePlayer(gameState, playerId);
	}

	function handleSelectCategory(category: Category) {
		gameState = selectCategory(gameState, category);
	}

	function handleStartGame() {
		gameState = startGame(gameState, sampleWords, sampleCategories);
	}

	function handleReshuffleWord() {
		gameState = reshuffleWord(gameState, sampleCategories, sampleWords);
	}

	function handleRevealComplete() {
		gameState = moveToPlayingPhase(gameState);
	}

	function handleRoundWinner(event: CustomEvent<'impostor' | 'players'>) {
		gameState = recordRoundWinner(gameState, event.detail);
	}

	function handleReverseRoundWinner(event: CustomEvent<'impostor' | 'players'>) {
		gameState = reverseRoundWinner(gameState, event.detail);
	}

	function handleNextRound() {
		gameState = startNextRound(gameState, sampleWords, sampleCategories);
	}

	function handleEndGame() {
		gameState = showFinalResults(gameState);
	}

	function handleAccuse(accuserId: string, accusedId: string) {
		gameState = addAccusation(gameState, accuserId, accusedId);
	}

	function handleStartVoting() {
		gameState = startVoting(gameState);
	}

	function handleVoteComplete(impostorCaught: boolean) {
		const winner = impostorCaught ? 'players' : 'impostor';
		gameState = endGame(gameState, winner);
	}

	function handleNewGame() {
		gameState = createInitialState();
		currentViewingPlayerId = null;
		viewedPlayers = new Set();
	}

	function handleViewPlayer(playerId: string) {
		currentViewingPlayerId = playerId;
	}

	function handleMarkViewed(playerId: string) {
		const newSet = new Set(viewedPlayers);
		newSet.add(playerId);
		viewedPlayers = newSet; // Trigger reactivity by creating new Set
	}

	function handleClearView() {
		// Clear the current view - next player will select themselves
		currentViewingPlayerId = null;
	}
</script>

<div class="game-container">
	{#if gameState.phase === 'setup'}
		<SetupScreen
			{gameState}
			{sampleCategories}
			on:addPlayer={handleAddPlayer}
			on:removePlayer={(e) => handleRemovePlayer(e.detail)}
			on:selectCategory={(e) => handleSelectCategory(e.detail)}
			on:startGame={handleStartGame}
			bind:playerNameInput
		/>
	{:else if gameState.phase === 'reveal'}
		<RevealScreen
			{gameState}
			{currentViewingPlayerId}
			{viewedPlayers}
			on:viewPlayer={(e) => handleViewPlayer(e.detail)}
			on:markViewed={(e) => handleMarkViewed(e.detail)}
			on:clearView={handleClearView}
			on:complete={handleRevealComplete}
			on:roundWinner={(e) => handleRoundWinner(e)}
			on:reverseRoundWinner={(e) => handleReverseRoundWinner(e)}
			on:nextRound={handleNextRound}
			on:endGame={handleEndGame}
			on:reshuffleWord={handleReshuffleWord}
		/>
	{:else if gameState.phase === 'playing'}
		<GameScreen
			{gameState}
			on:accuse={(e) => handleAccuse(e.detail.accuserId, e.detail.accusedId)}
			on:startVoting={handleStartVoting}
		/>
	{:else if gameState.phase === 'voting'}
		<VotingScreen
			{gameState}
			on:voteComplete={(e) => handleVoteComplete(e.detail)}
		/>
	{:else if gameState.phase === 'roundResults'}
		<RevealScreen
			{gameState}
			{currentViewingPlayerId}
			{viewedPlayers}
			on:roundWinner={(e) => handleRoundWinner(e)}
			on:reverseRoundWinner={(e) => handleReverseRoundWinner(e)}
			on:nextRound={handleNextRound}
			on:endGame={handleEndGame}
			on:reshuffleWord={handleReshuffleWord}
		/>
	{:else if gameState.phase === 'finalResults'}
		<FinalResultsScreen {gameState} on:newGame={handleNewGame} />
	{/if}
</div>

<style>
	.game-container {
		min-height: 100vh;
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
