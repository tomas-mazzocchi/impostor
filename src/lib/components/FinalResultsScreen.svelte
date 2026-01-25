<script lang="ts">
  import type { GameState } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import { getPlayersByScore } from "$lib/game/local-mode";
  import StandingsTable from "./StandingsTable.svelte";

  export let gameState: GameState;

  const dispatch = createEventDispatcher();

  const rankedPlayers = getPlayersByScore(gameState);
  const highestScore = rankedPlayers.length > 0 ? rankedPlayers[0].score : 0;
  const winners = rankedPlayers.filter((player) => player.score === highestScore);
</script>

<div class="flex flex-col gap-8 items-center w-full max-w-[800px] mx-auto">
  <h1 class="text-center text-4xl text-gray-800">Clasificación Final</h1>

  <div class="bg-gradient-to-br from-yellow-300 to-orange-400 p-8 rounded-2xl text-center w-full shadow-md">
    {#if winners.length === 1}
      <h2 class="text-3xl mb-2 text-gray-800">🏆 Ganador: {winners[0].name} 🏆</h2>
      <p class="text-2xl mt-2 text-gray-700 font-bold">Puntaje Final: {winners[0].score} puntos</p>
    {:else}
      <h2 class="text-3xl mb-2 text-gray-800">🏆 Ganadores 🏆</h2>
      <div class="flex flex-wrap gap-3 justify-center my-4">
        {#each winners as winner}
          <div class="bg-white/30 px-4 py-2 rounded-full text-xl font-bold">
            <span class="text-gray-800">{winner.name}</span>
          </div>
        {/each}
      </div>
      <p class="text-2xl mt-2 text-gray-700 font-bold">Puntaje Final: {highestScore} puntos</p>
    {/if}
  </div>

  <div class="w-full">
    <StandingsTable {gameState} />
  </div>

  <button 
    class="px-8 py-4 text-xl bg-primary text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-blue-700"
    on:click={() => dispatch('newGame')}
  >
    Nuevo Juego
  </button>
</div>
