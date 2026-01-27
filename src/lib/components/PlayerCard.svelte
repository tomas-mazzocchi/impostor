<script lang="ts">
  import type { Player } from "$lib/game/types";
  import Button from "./ui/Button.svelte";

  export let player: Player;
  export let categoryName: string;
  export let onClose: () => void;

  $: isImpostor = player.role === 'impostor';
</script>

<div class="bg-white border-4 {isImpostor ? 'border-danger' : 'border-primary'} rounded-2xl p-8 max-w-[500px] text-center shadow-md">
  <h2 class="mb-4 text-2xl">{player.name}</h2>
  <div
    class="inline-block px-6 py-2 rounded-full font-bold mb-6 text-lg text-white {isImpostor ? 'bg-danger' : 'bg-success'}"
  >
    {isImpostor ? "IMPOSTOR" : "JUGADOR"}
  </div>
  <div class="text-left">
    <p class="my-4 text-xl">
      <strong>Categoría:</strong>
      {categoryName}
    </p>
    {#if !isImpostor}
      <p class="text-2xl text-primary font-bold">
        <strong>Tu palabra:</strong>
        {player.word}
      </p>
    {/if}
  </div>
  <div class="mt-6 flex gap-4 flex-col">
    <Button variant="secondary" size="md" on:click={onClose}>
      Cerrar mi tarjeta
    </Button>
  </div>
</div>
