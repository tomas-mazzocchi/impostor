<script lang="ts">
  import type { Player } from "$lib/game/types";

  export let leaders: Player[];
  export let score: number;
  export let title = '';

  $: isSingleLeader = leaders.length === 1;
</script>

<div class="bg-gradient-to-br from-yellow-300 to-orange-400 p-6 rounded-2xl text-center w-full shadow-md">
  {#if isSingleLeader}
    <h3 class="text-2xl mb-1 text-gray-800">
      🏆 {leaders[0].name} 🏆
    </h3>
    <p class="text-lg text-gray-700 font-bold">{score} puntos</p>
  {:else}
    <h3 class="text-2xl mb-1 text-gray-800">
      🏆 {title || 'Liderando'} 🏆
    </h3>
    <div class="flex flex-wrap gap-2 justify-center my-2">
      {#each leaders as leader}
        <div class="bg-white/30 px-3 py-1 rounded-full text-base font-bold">
          <span class="text-gray-800">{leader.name}</span>
        </div>
      {/each}
    </div>
    <p class="text-lg text-gray-700 font-bold">{score} puntos</p>
  {/if}
</div>
