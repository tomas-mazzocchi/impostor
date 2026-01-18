<script lang="ts">
  import type { GameState } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import { getPlayersByScore } from "$lib/game/local-mode";

  export let gameState: GameState;

  const dispatch = createEventDispatcher();

  const rankedPlayers = getPlayersByScore(gameState);
  const highestScore = rankedPlayers.length > 0 ? rankedPlayers[0].score : 0;
  const winners = rankedPlayers.filter((player) => player.score === highestScore);
</script>

<div class="flex flex-col gap-8 items-center w-full max-w-[800px] mx-auto">
  <h1 class="text-center text-4xl text-gray-800">Final Rankings</h1>

  <div class="bg-gradient-to-br from-yellow-300 to-orange-400 p-8 rounded-2xl text-center w-full shadow-md">
    {#if winners.length === 1}
      <h2 class="text-3xl mb-2 text-gray-800">🏆 Winner: {winners[0].name} 🏆</h2>
      <p class="text-2xl mt-2 text-gray-700 font-bold">Final Score: {winners[0].score} points</p>
    {:else}
      <h2 class="text-3xl mb-2 text-gray-800">🏆 Winners 🏆</h2>
      <div class="flex flex-wrap gap-3 justify-center my-4">
        {#each winners as winner}
          <div class="bg-white/30 px-4 py-2 rounded-full text-xl font-bold">
            <span class="text-gray-800">{winner.name}</span>
          </div>
        {/each}
      </div>
      <p class="text-2xl mt-2 text-gray-700 font-bold">Final Score: {highestScore} points</p>
    {/if}
  </div>

  <div class="w-full flex flex-col gap-4">
    {#each rankedPlayers as player, index}
      <div class="flex items-center gap-6 bg-white p-6 rounded-xl border-2 shadow {player.score === highestScore ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg' : 'border-gray-border'}">
        <div class="text-3xl font-bold min-w-[60px] text-center">
          {#if player.score === highestScore}
            🥇
          {:else if index === 1 && rankedPlayers[1].score !== highestScore}
            🥈
          {:else if index === 2 && rankedPlayers[2]?.score !== highestScore && rankedPlayers[1].score !== highestScore}
            🥉
          {:else}
            #{index + 1}
          {/if}
        </div>
        <div class="flex-1">
          <h3 class="mb-1 text-2xl text-gray-800">{player.name}</h3>
          <p class="text-lg text-gray-text font-bold">Score: {player.score}</p>
        </div>
      </div>
    {/each}
  </div>

  <button 
    class="px-8 py-4 text-xl bg-primary text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-blue-700"
    on:click={() => dispatch('newGame')}
  >
    New Game
  </button>
</div>
