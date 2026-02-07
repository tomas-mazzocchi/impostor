<script lang="ts">
	import type { GameState, Category } from '$lib/game/types';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import HelpButton from './HelpButton.svelte';
	import Button from './ui/Button.svelte';

	export let gameState: GameState;
	export let playerNameInput: string;
	export let impostorCount: number = 1;

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

	$: maxImpostors = Math.max(1, gameState.players.length - 1);
	$: canStartGame = gameState.players.length >= 3;
</script>

<HelpButton />

<div class="flex flex-col gap-8">
	<h1 class="text-center text-2xl mb-4">Configuración del Juego</h1>

	<section class="bg-gray-light p-6 rounded-lg">
		<h2 class="text-xl mb-4">Jugadores ({gameState.players.length})</h2>
		<div class="flex flex-wrap items-center gap-4 mb-4">
			<label class="flex items-center gap-2">
				<span class="text-gray-700">Impostores</span>
				<input
					type="number"
					min="1"
					max={maxImpostors}
					bind:value={impostorCount}
					class="w-20 p-2 border border-gray-border rounded text-center"
				/>
			</label>
		</div>
		<div class="flex gap-2 mb-4">
			<input
				type="text"
				placeholder="Nombre"
				bind:value={playerNameInput}
				on:keypress={handleKeyPress}
				class="flex-1 p-2 border border-gray-border rounded"
			/>
			<Button variant="primary" size="md" on:click={handleAddPlayer}>
				Agregar
			</Button>
		</div>
		<ul class="list-none p-0 flex flex-col gap-2">
			{#each gameState.players as player (player.id)}
				<li class="flex justify-between items-center p-2 bg-white rounded">
					<span>{player.name}</span>
					<Button variant="danger" size="sm" on:click={() => dispatch('removePlayer', player.id)}>
						Eliminar
					</Button>
				</li>
			{/each}
		</ul>
	</section>

	<div class="self-center">
		<Button variant="success" size="xl" disabled={!canStartGame} on:click={() => dispatch('startGame')}>
			Comenzar Juego
		</Button>
	</div>
</div>
