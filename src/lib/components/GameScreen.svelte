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

<div class="flex flex-col gap-8">
	<h1 class="text-center text-2xl">Game in Progress</h1>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
		<div class="bg-gray-light p-6 rounded-lg text-center">
			<h2 class="mb-2 text-base text-gray-text">Category</h2>
			<p class="text-2xl font-bold text-primary m-0">{gameState.category?.name}</p>
		</div>
		<div class="bg-gray-light p-6 rounded-lg text-center">
			<h2 class="mb-2 text-base text-gray-text">Current Phase</h2>
			<p class="m-0">Players are giving clues and discussing</p>
		</div>
	</div>

	<div class="bg-gray-light p-6 rounded-lg">
		<h2 class="text-xl mb-4">Players</h2>
		<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-4">
			{#each gameState.players as player}
				<div class="bg-white p-4 rounded-lg text-center">
					<h3 class="mb-2">{player.name}</h3>
					{#if gameState.accusations[player.id]}
						<p class="text-danger font-bold mt-2 m-0">
							Accuses: {getPlayerById(gameState, gameState.accusations[player.id])?.name}
						</p>
					{:else}
						<div class="mt-2">
							<select
								class="w-full p-2 border-2 border-primary rounded cursor-pointer"
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

	<div class="text-center text-lg">
		<p>Accusations: {getAccusationCount()} / {gameState.players.length}</p>
	</div>

	<button
		class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer self-center disabled:bg-gray-300 disabled:cursor-not-allowed"
		disabled={!canStartVoting()}
		on:click={handleStartVoting}
	>
		Start Voting Phase
	</button>
</div>
