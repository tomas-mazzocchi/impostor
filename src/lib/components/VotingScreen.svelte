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

<div class="flex flex-col gap-8">
	<h1 class="text-center text-2xl">Voting Phase</h1>
	<p class="text-center text-gray-text">Each player votes for who they think is the impostor.</p>

	<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
		{#each gameState.players as player}
			<div class="bg-gray-light p-6 rounded-lg">
				<h3 class="mb-4 text-center">{player.name}</h3>
				{#if votes[player.id]}
					<p class="text-center text-success font-bold">Voted: {getPlayerById(gameState, votes[player.id])?.name}</p>
				{:else}
					<div class="flex flex-col gap-2">
						{#each gameState.players.filter((p) => p.id !== player.id) as candidate}
							<button
								class="px-3 py-3 bg-white border-2 border-primary rounded cursor-pointer transition-all hover:bg-blue-50"
								on:click={() => handleVote(player.id, candidate.id)}
							>
								{candidate.name}
							</button>
						{/each}
					</div>
				{/if}
				<div class="mt-4 text-center font-bold text-gray-text">Votes against: {getVoteCount(player.id)}</div>
			</div>
		{/each}
	</div>

	<button
		class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer self-center disabled:bg-gray-300 disabled:cursor-not-allowed"
		disabled={!allVoted()}
		on:click={handleCompleteVoting}
	>
		Complete Voting
	</button>
</div>
