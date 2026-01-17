<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { getPlayerById } from '$lib/game/local-mode';

	export let gameState: GameState;

	const dispatch = createEventDispatcher();
	let selectedAccused: Record<string, string> = {};

	function handleAccuse(accuserId: string, accusedId: string) {
		dispatch('accuse', { accuserId, accusedId });
		selectedAccused[accuserId] = '';
	}

	function handleStartVoting() {
		dispatch('startVoting');
	}

	function canStartVoting(): boolean {
		return Object.keys(gameState.accusations).length >= gameState.players.length - 1;
	}

	function getAccusationCount(): number {
		return Object.keys(gameState.accusations).length;
	}
</script>

<div class="game-screen">
	<h1>Game in Progress</h1>

	<div class="game-info">
		<div class="info-card">
			<h2>Category</h2>
			<p class="category-name">{gameState.category?.name}</p>
		</div>
		<div class="info-card">
			<h2>Current Phase</h2>
			<p>Players are giving clues and discussing</p>
		</div>
	</div>

	<div class="players-section">
		<h2>Players</h2>
		<div class="players-grid">
			{#each gameState.players as player}
				<div class="player-card">
					<h3>{player.name}</h3>
					{#if gameState.accusations[player.id]}
						<p class="accusation">
							Accuses: {getPlayerById(gameState, gameState.accusations[player.id])?.name}
						</p>
					{:else}
						<div class="accuse-section">
							<select
								class="accuse-select"
								bind:value={selectedAccused[player.id]}
								on:change={() => {
									if (selectedAccused[player.id]) {
										handleAccuse(player.id, selectedAccused[player.id]);
									}
								}}
							>
								<option value="">Select player to accuse</option>
								{#each gameState.players.filter((p) => p.id !== player.id) as candidate}
									<option value={candidate.id}>{candidate.name}</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="progress">
		<p>Accusations: {getAccusationCount()} / {gameState.players.length}</p>
	</div>

	<button
		class="voting-button"
		disabled={!canStartVoting()}
		on:click={handleStartVoting}
	>
		Start Voting Phase
	</button>
</div>

<style>
	.game-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	h1 {
		text-align: center;
		font-size: 2rem;
	}

	.game-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.info-card {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: center;
	}

	.info-card h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: #666;
	}

	.category-name {
		font-size: 1.5rem;
		font-weight: bold;
		color: #007bff;
		margin: 0;
	}

	.players-section {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.players-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.player-card {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
	}

	.player-card h3 {
		margin: 0 0 0.5rem 0;
	}

	.accusation {
		color: #dc3545;
		font-weight: bold;
		margin: 0.5rem 0 0 0;
	}

	.accuse-section {
		margin-top: 0.5rem;
	}

	.accuse-select {
		width: 100%;
		padding: 0.5rem;
		border: 2px solid #007bff;
		border-radius: 4px;
		cursor: pointer;
	}

	.progress {
		text-align: center;
		font-size: 1.1rem;
	}

	.voting-button {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		align-self: center;
	}

	.voting-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>
