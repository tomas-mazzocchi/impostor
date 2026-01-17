<script lang="ts">
	import type { GameState, Category } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	export let gameState: GameState;
	export let playerNameInput: string;
	export let sampleCategories: Category[];

	const dispatch = createEventDispatcher();

	function handleAddPlayer() {
		if (playerNameInput.trim()) {
			dispatch('addPlayer');
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleAddPlayer();
		}
	}

	function selectRandomCategory() {
		if (sampleCategories.length > 0 && gameState.category === null) {
			const randomIndex = Math.floor(Math.random() * sampleCategories.length);
			const randomCategory = sampleCategories[randomIndex];
			dispatch('selectCategory', randomCategory);
		}
	}

	// Automatically select a random category when there are enough players
	$: if (gameState.players.length >= 3 && gameState.category === null) {
		selectRandomCategory();
	}

	$: canStartGame = gameState.players.length >= 3 && gameState.category !== null;
</script>

<div class="setup-screen">
	<h1>Game Setup</h1>

	<section class="players-section">
		<h2>Players ({gameState.players.length})</h2>
		<div class="player-input">
			<input
				type="text"
				placeholder="Enter player name"
				bind:value={playerNameInput}
				on:keypress={handleKeyPress}
			/>
			<button on:click={handleAddPlayer}>Add Player</button>
		</div>
		<ul class="player-list">
			{#each gameState.players as player (player.id)}
				<li>
					<span>{player.name}</span>
					<button on:click={() => dispatch('removePlayer', player.id)}>Remove</button>
				</li>
			{/each}
		</ul>
	</section>

	<!-- <section class="category-section">
		<h2>Select Category</h2>
		<div class="category-grid">
			{#each sampleCategories as category}
				<button
					class="category-card"
					class:selected={gameState.category?.id === category.id}
					on:click={() => dispatch('selectCategory', category)}
				>
					<h3>{category.name}</h3>
					{#if category.description}
						<p>{category.description}</p>
					{/if}
				</button>
			{/each}
		</div>
	</section> -->

	<button
		class="start-button"
		disabled={!canStartGame}
		on:click={() => dispatch('startGame')}
	>
		Start Game
	</button>
</div>

<style>
	.setup-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	h1 {
		text-align: center;
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.players-section,
	.category-section {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.player-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.player-input input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.player-input button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.player-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.player-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: white;
		border-radius: 4px;
	}

	.player-list button {
		padding: 0.25rem 0.5rem;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.category-card {
		padding: 1.5rem;
		background: white;
		border: 2px solid #ddd;
		border-radius: 8px;
		cursor: pointer;
		text-align: center;
		transition: all 0.2s;
	}

	.category-card:hover {
		border-color: #007bff;
		transform: translateY(-2px);
	}

	.category-card.selected {
		border-color: #007bff;
		background: #e7f3ff;
	}

	.category-card h3 {
		margin: 0 0 0.5rem 0;
	}

	.category-card p {
		margin: 0;
		font-size: 0.9rem;
		color: #666;
	}

	.start-button {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		align-self: center;
	}

	.start-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>
