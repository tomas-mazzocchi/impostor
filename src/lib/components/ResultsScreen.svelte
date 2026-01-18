<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { getImpostor } from '$lib/game/local-mode';

	export let gameState: GameState;

	const dispatch = createEventDispatcher();

	const impostor = getImpostor(gameState);
</script>

<div class="flex flex-col gap-8 items-center">
	<h1 class="text-center text-4xl">Game Over!</h1>

	<div class="p-8 rounded-2xl text-center max-w-[500px] text-white {gameState.winner === 'impostor' ? 'bg-danger' : 'bg-success'}">
		{#if gameState.winner === 'impostor'}
			<h2 class="text-3xl mb-2 m-0">Impostor Wins!</h2>
			<p class="text-xl m-0">The impostor successfully avoided detection.</p>
		{:else}
			<h2 class="text-3xl mb-2 m-0">Players Win!</h2>
			<p class="text-xl m-0">The impostor was caught!</p>
		{/if}
	</div>

	<div class="text-center">
		<h2 class="text-2xl mb-4">The Impostor was:</h2>
		<div class="bg-gray-light p-8 rounded-xl mt-4">
			<h3 class="text-3xl mb-2 m-0 text-danger">{impostor?.name}</h3>
			<p class="inline-block bg-danger text-white px-6 py-2 rounded-full font-bold m-0">IMPOSTOR</p>
		</div>
	</div>

	<div class="bg-gray-light p-6 rounded-lg max-w-[600px] w-full">
		<h2 class="text-xl mb-4">All Words</h2>
		<div class="flex flex-col gap-2 mt-4">
			{#each gameState.players as player}
				<div class="bg-white p-3 rounded">
					<strong>{player.name}:</strong>
					{#if player.role === 'impostor'}
						<span class="text-danger italic">??? (Impostor - didn't know the word)</span>
					{:else}
						<span>{player.word}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<button 
		class="px-8 py-4 text-xl bg-primary text-white border-none rounded-lg cursor-pointer transition-colors hover:bg-blue-700"
		on:click={() => dispatch('newGame')}
	>
		New Game
	</button>
</div>
