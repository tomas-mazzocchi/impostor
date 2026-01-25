<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState, Category, Word, RoundResult } from '$lib/game/types';
	import {
		createInitialState,
		addPlayer,
		removePlayer,
		selectCategory,
		startGame,
		moveToPlayingPhase,
		addAccusation,
		startVoting,
		recordRoundScores,
		startNextRound,
		showFinalResults,
		reshuffleWord
	} from '$lib/game/local-mode';
	import SetupScreen from '$lib/components/SetupScreen.svelte';
	import RevealScreen from '$lib/components/RevealScreen.svelte';
	import GameScreen from '$lib/components/GameScreen.svelte';
	import FinalResultsScreen from '$lib/components/FinalResultsScreen.svelte';

	let gameState: GameState = createInitialState();
	let playerNameInput = '';
	let currentViewingPlayerId: string | null = null;
	let viewedPlayers: Set<string> = new Set();

	let sampleCategories: Category[] = [];
	let sampleWords: Word[] = [];
	let loading = true;
	let error: string | null = null;

	async function loadGameData() {
		try {
			loading = true;
			error = null;

			// Fetch categories and words in parallel
			const [categoriesResponse, wordsResponse] = await Promise.all([
				fetch('/api/categories'),
				fetch('/api/words')
			]);

			if (!categoriesResponse.ok) {
				throw new Error('Failed to load categories');
			}
			if (!wordsResponse.ok) {
				throw new Error('Failed to load words');
			}

			const categoriesData = await categoriesResponse.json();
			const wordsData = await wordsResponse.json();

			// Transform categories to match expected format
			sampleCategories = categoriesData.categories.map((cat: any) => ({
				id: cat.id,
				name: cat.name,
				description: cat.description || undefined
			}));

			// Words are already in the correct format from the API
			sampleWords = wordsData.words || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load game data';
			console.error('Error loading game data:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadGameData();
	});

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

	function handleRecordRoundScores(event: CustomEvent<RoundResult>) {
		gameState = recordRoundScores(gameState, event.detail);
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

<div class="min-h-screen p-8 max-w-[1200px] mx-auto">
	{#if loading}
		<div class="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
			<p>Loading game data...</p>
		</div>
	{:else if error}
		<div class="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
			<h2 class="text-danger m-0">Error loading game data</h2>
			<p>{error}</p>
			<button 
				class="px-6 py-3 bg-primary text-white border-none rounded-lg cursor-pointer text-base transition-colors hover:bg-blue-700"
				on:click={loadGameData}
			>
				Retry
			</button>
		</div>
	{:else if gameState.phase === 'setup'}
		<SetupScreen
			{gameState}
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
			on:viewPlayer={(e) => handleViewPlayer(e.detail)}
			on:markViewed={(e) => handleMarkViewed(e.detail)}
			on:clearView={handleClearView}
			on:complete={handleRevealComplete}
			on:recordRoundScores={handleRecordRoundScores}
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
	{:else if gameState.phase === 'roundResults'}
		<RevealScreen
			{gameState}
			{currentViewingPlayerId}
			on:recordRoundScores={handleRecordRoundScores}
			on:nextRound={handleNextRound}
			on:endGame={handleEndGame}
			on:reshuffleWord={handleReshuffleWord}
		/>
	{:else if gameState.phase === 'finalResults'}
		<FinalResultsScreen {gameState} on:newGame={handleNewGame} />
	{/if}
</div>
