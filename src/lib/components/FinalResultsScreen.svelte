<script lang="ts">
  import type { GameState } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import { getPlayersByScore } from "$lib/game/local-mode";
  import StandingsTable from "./StandingsTable.svelte";
  import LeaderBanner from "./ui/LeaderBanner.svelte";
  import Button from "./ui/Button.svelte";

  export let gameState: GameState;

  const dispatch = createEventDispatcher();

  const rankedPlayers = getPlayersByScore(gameState);
  const highestScore = rankedPlayers.length > 0 ? rankedPlayers[0].score : 0;
  const winners = rankedPlayers.filter((player) => player.score === highestScore);
</script>

<div class="flex flex-col gap-8 items-center w-full max-w-[800px] mx-auto">
  <h1 class="text-center text-4xl text-gray-800">Clasificación Final</h1>

  <LeaderBanner leaders={winners} score={highestScore} title="Ganador{winners.length > 1 ? 'es' : ''}" />

  <div class="w-full">
    <StandingsTable {gameState} />
  </div>

  <Button variant="primary" size="xl" on:click={() => dispatch('newGame')}>
    Nuevo Juego
  </Button>
</div>
