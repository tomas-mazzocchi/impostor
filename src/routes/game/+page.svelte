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
		<button 
			class="px-6 py-3 bg-primary text-white border-none rounded-lg cursor-pointer text-base transition-colors hover:bg-blue-700"
			on:click={loadGameData}
		>
			Reintentar
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

	<!-- New Game Modal -->
	{#if showNewGameModal}
		<div 
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
			role="button"
			tabindex="0"
			on:click={handleCancelNewGame}
			on:keydown={(e) => e.key === 'Escape' && handleCancelNewGame()}
		>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<div 
				class="bg-white rounded-2xl p-8 max-w-[500px] w-full mx-4 shadow-2xl" 
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				on:click={(e) => e.stopPropagation()}
			>
				<h2 id="modal-title" class="text-3xl font-bold text-center mb-6 text-gray-800">Nuevo Juego</h2>
				<p class="text-lg text-center mb-8 text-gray-600">¿Querés mantener a los mismos jugadores?</p>
				
				<div class="flex flex-col gap-4">
					<button
						class="px-8 py-4 text-xl bg-primary text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-blue-700"
						on:click={handleKeepPlayers}
					>
						Mantener Jugadores
					</button>
					<button
						class="px-8 py-4 text-xl bg-gray-600 text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-gray-700"
						on:click={handleNewPlayers}
					>
						Nuevos Jugadores
					</button>
					<button
						class="px-6 py-3 text-base bg-transparent text-gray-600 border-2 border-gray-300 rounded-lg cursor-pointer font-bold transition-colors hover:bg-gray-100"
						on:click={handleCancelNewGame}
					>
						Cancelar
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
