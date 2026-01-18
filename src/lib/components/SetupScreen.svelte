<script lang="ts">
	import type { GameState, Category } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	export let gameState: GameState;
	export let playerNameInput: string;

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

	$: canStartGame = gameState.players.length >= 3;
</script>

<div class="flex flex-col gap-8">
	<h1 class="text-center text-2xl mb-4">Game Setup</h1>

	<section class="bg-gray-light p-6 rounded-lg">
		<h2 class="text-xl mb-4">Players ({gameState.players.length})</h2>
		<div class="flex gap-2 mb-4">
			<input
				type="text"
				placeholder="Enter player name"
				bind:value={playerNameInput}
				on:keypress={handleKeyPress}
				class="flex-1 p-2 border border-gray-border rounded"
			/>
			<button 
				on:click={handleAddPlayer}
				class="px-4 py-2 bg-primary text-white border-none rounded cursor-pointer"
			>
				Add Player
			</button>
		</div>
		<ul class="list-none p-0 flex flex-col gap-2">
			{#each gameState.players as player (player.id)}
				<li class="flex justify-between items-center p-2 bg-white rounded">
					<span>{player.name}</span>
					<button 
						on:click={() => dispatch('removePlayer', player.id)}
						class="px-2 py-1 bg-danger text-white border-none rounded cursor-pointer"
					>
						Remove
					</button>
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
		class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer self-center disabled:bg-gray-300 disabled:cursor-not-allowed"
		disabled={!canStartGame}
		on:click={() => dispatch('startGame')}
	>
		Start Game
	</button>
</div>
