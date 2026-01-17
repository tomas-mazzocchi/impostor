<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { getImpostor, getPlayerById } from '$lib/game/local-mode';

	export let gameState: GameState;

	const dispatch = createEventDispatcher();

	let votes: Record<string, string> = {};

	function handleVote(voterId: string, votedId: string) {
		votes[voterId] = votedId;
	}

	function handleCompleteVoting() {
		const voteCounts: Record<string, number> = {};
		Object.values(votes).forEach((votedId) => {
			voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
		});

		const maxVotes = Math.max(...Object.values(voteCounts));
		const mostVoted = Object.keys(voteCounts).find((id) => voteCounts[id] === maxVotes);
		const impostor = getImpostor(gameState);

		const impostorCaught = mostVoted === impostor?.id;
		dispatch('voteComplete', impostorCaught);
	}

	function allVoted(): boolean {
		return Object.keys(votes).length === gameState.players.length;
	}

	function getVoteCount(playerId: string): number {
		return Object.values(votes).filter((v) => v === playerId).length;
	}
</script>

<div class="voting-screen">
	<h1>Voting Phase</h1>
	<p class="instructions">Each player votes for who they think is the impostor.</p>

	<div class="voting-section">
		{#each gameState.players as player}
			<div class="vote-card">
				<h3>{player.name}</h3>
				{#if votes[player.id]}
					<p class="voted">Voted: {getPlayerById(gameState, votes[player.id])?.name}</p>
				{:else}
					<div class="vote-options">
						{#each gameState.players.filter((p) => p.id !== player.id) as candidate}
							<button
								class="vote-button"
								on:click={() => handleVote(player.id, candidate.id)}
							>
								{candidate.name}
							</button>
						{/each}
					</div>
				{/if}
				<div class="vote-count">Votes against: {getVoteCount(player.id)}</div>
			</div>
		{/each}
	</div>

	<button
		class="complete-button"
		disabled={!allVoted()}
		on:click={handleCompleteVoting}
	>
		Complete Voting
	</button>
</div>

<style>
	.voting-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	h1 {
		text-align: center;
		font-size: 2rem;
	}

	.instructions {
		text-align: center;
		color: #666;
	}

	.voting-section {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.vote-card {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.vote-card h3 {
		margin: 0 0 1rem 0;
		text-align: center;
	}

	.voted {
		text-align: center;
		color: #28a745;
		font-weight: bold;
	}

	.vote-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.vote-button {
		padding: 0.75rem;
		background: white;
		border: 2px solid #007bff;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.vote-button:hover {
		background: #e7f3ff;
	}

	.vote-count {
		margin-top: 1rem;
		text-align: center;
		font-weight: bold;
		color: #666;
	}

	.complete-button {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		align-self: center;
	}

	.complete-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>
