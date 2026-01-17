<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { getImpostor } from '$lib/game/local-mode';

	export let gameState: GameState;

	const dispatch = createEventDispatcher();

	const impostor = getImpostor(gameState);
</script>

<div class="results-screen">
	<h1>Game Over!</h1>

	<div class="result-card" class:impostor-won={gameState.winner === 'impostor'}>
		{#if gameState.winner === 'impostor'}
			<h2 class="result-title">Impostor Wins!</h2>
			<p class="result-message">The impostor successfully avoided detection.</p>
		{:else}
			<h2 class="result-title">Players Win!</h2>
			<p class="result-message">The impostor was caught!</p>
		{/if}
	</div>

	<div class="reveal-section">
		<h2>The Impostor was:</h2>
		<div class="impostor-reveal">
			<h3>{impostor?.name}</h3>
			<p class="impostor-badge">IMPOSTOR</p>
		</div>
	</div>

	<div class="words-section">
		<h2>All Words</h2>
		<div class="words-list">
			{#each gameState.players as player}
				<div class="word-item">
					<strong>{player.name}:</strong>
					{#if player.role === 'impostor'}
						<span class="impostor-word">??? (Impostor - didn't know the word)</span>
					{:else}
						<span>{player.word}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<button class="new-game-button" on:click={() => dispatch('newGame')}>
		New Game
	</button>
</div>

<style>
	.results-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		align-items: center;
	}

	h1 {
		text-align: center;
		font-size: 2.5rem;
	}

	.result-card {
		background: #28a745;
		color: white;
		padding: 2rem;
		border-radius: 16px;
		text-align: center;
		max-width: 500px;
	}

	.result-card.impostor-won {
		background: #dc3545;
	}

	.result-title {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
	}

	.result-message {
		font-size: 1.2rem;
		margin: 0;
	}

	.reveal-section {
		text-align: center;
	}

	.impostor-reveal {
		background: #f5f5f5;
		padding: 2rem;
		border-radius: 12px;
		margin-top: 1rem;
	}

	.impostor-reveal h3 {
		font-size: 1.8rem;
		margin: 0 0 0.5rem 0;
		color: #dc3545;
	}

	.impostor-badge {
		display: inline-block;
		background: #dc3545;
		color: white;
		padding: 0.5rem 1.5rem;
		border-radius: 20px;
		font-weight: bold;
		margin: 0;
	}

	.words-section {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		max-width: 600px;
		width: 100%;
	}

	.words-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.word-item {
		background: white;
		padding: 0.75rem;
		border-radius: 4px;
	}

	.impostor-word {
		color: #dc3545;
		font-style: italic;
	}

	.new-game-button {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.new-game-button:hover {
		background: #0056b3;
	}
</style>
