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
		reshuffleWord,
		resetGameWithSamePlayers
	} from '$lib/game/local-mode';
	import SetupScreen from '$lib/components/SetupScreen.svelte';
	import RevealScreen from '$lib/components/RevealScreen.svelte';
	import GameScreen from '$lib/components/GameScreen.svelte';
	import FinalResultsScreen from '$lib/components/FinalResultsScreen.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let gameState: GameState = createInitialState();
	let playerNameInput = '';
	let currentViewingPlayerId: string | null = null;
	let viewedPlayers: Set<string> = new Set();
	let showNewGameModal = false;

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
			throw new Error('Error al cargar las categorías');
		}
		if (!wordsResponse.ok) {
			throw new Error('Error al cargar las palabras');
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
		error = err instanceof Error ? err.message : 'Error al cargar los datos del juego';
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
		showNewGameModal = true;
	}

	function handleKeepPlayers() {
		gameState = resetGameWithSamePlayers(gameState, sampleWords, sampleCategories);
		currentViewingPlayerId = null;
		viewedPlayers = new Set();
		showNewGameModal = false;
	}

	function handleNewPlayers() {
		gameState = createInitialState();
		currentViewingPlayerId = null;
		viewedPlayers = new Set();
		showNewGameModal = false;
	}

	function handleCancelNewGame() {
		showNewGameModal = false;
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
		<p>Cargando datos del juego...</p>
	</div>
{:else if error}
	<div class="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
		<h2 class="text-danger m-0">Error al cargar los datos del juego</h2>
		<p>{error}</p>
		<Button variant="primary" size="lg" on:click={loadGameData}>
			Reintentar
		</Button>
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

	<!-- New Game Modal -->
	<Modal open={showNewGameModal} title="Nuevo Juego" maxWidth="500px" on:close={handleCancelNewGame}>
		<p class="text-lg text-center mb-8 text-gray-600">¿Querés mantener a los mismos jugadores?</p>
		
		<div class="flex flex-col gap-4">
			<Button variant="primary" size="xl" on:click={handleKeepPlayers}>
				Mantener Jugadores
			</Button>
			<Button variant="secondary" size="xl" on:click={handleNewPlayers}>
				Nuevos Jugadores
			</Button>
			<button
				class="px-6 py-3 text-base bg-transparent text-gray-600 border-2 border-gray-300 rounded-lg cursor-pointer font-bold transition-colors hover:bg-gray-100"
				on:click={handleCancelNewGame}
			>
				Cancelar
			</button>
		</div>
	</Modal>
</div>
