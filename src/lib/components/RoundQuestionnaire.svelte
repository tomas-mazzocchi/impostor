<script lang="ts">
  import type { Player } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import YesNoButtons from "./ui/YesNoButtons.svelte";
  import { toggleSetItem } from "$lib/utils/collections";
  import { createRoundResult } from "$lib/utils/roundResults";

  export let players: Player[];
  export let isComplete: boolean = false;

  const dispatch = createEventDispatcher();

  let impostorExpelled: boolean | null = null;
  let expellers: Set<string> = new Set();
  let roundsSurvived: number = 0;
  let impostorGuessedWord: boolean | null = null;
  let currentQuestionIndex = 0;

  function handleImpostorExpelledSelected(expelled: boolean) {
    impostorExpelled = expelled;
  }

  function toggleExpeller(playerId: string) {
    expellers = toggleSetItem(expellers, playerId);
  }

  function incrementRoundsSurvived() {
    if (roundsSurvived < players.length) {
      roundsSurvived++;
    }
  }

  function decrementRoundsSurvived() {
    if (roundsSurvived > 0) {
      roundsSurvived--;
    }
  }

  function handleImpostorGuessedWord(guessed: boolean) {
    impostorGuessedWord = guessed;
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
    }
  }

  function goToNextQuestion() {
    currentQuestionIndex++;
  }

  $: canGoToNextQuestion = (() => {
    if (currentQuestionIndex === 0) return impostorExpelled === true;
    if (currentQuestionIndex === 1) return expellers.size > 0;
    if (currentQuestionIndex === 2) return true;
    return false;
  })();

  $: canGoBack = currentQuestionIndex > 0;

  $: hasNextQuestion = (() => {
    if (currentQuestionIndex === 0 && impostorExpelled === false) return false;
    if (currentQuestionIndex === 3) return false;
    if (impostorExpelled === false) return false;
    return true;
  })();

  $: isComplete = (() => {
    if (impostorExpelled === false) return true;
    if (impostorExpelled === true) {
      return expellers.size > 0 && impostorGuessedWord !== null;
    }
    return false;
  })();

  export function getRoundResult() {
    return createRoundResult(impostorExpelled, expellers, roundsSurvived, impostorGuessedWord);
  }
</script>

<div class="flex flex-col gap-6 w-full">
  {#if currentQuestionIndex === 0}
    <!-- Question 1: Was the impostor expelled? -->
    <div class="w-full text-center p-8 bg-gray-light rounded-xl">
      <h2 class="mb-6 text-3xl text-gray-800">¿Fue expulsado el impostor?</h2>
      <YesNoButtons value={impostorExpelled} onSelect={handleImpostorExpelledSelected} />
    </div>
  {:else if currentQuestionIndex === 1 && impostorExpelled === true}
    <!-- Question 2: Who expelled the impostor? -->
    <div class="w-full text-center p-8 bg-gray-light rounded-xl">
      <h2 class="mb-6 text-3xl text-gray-800">¿Quién expulsó al impostor?</h2>
      <p class="mb-6 text-lg text-gray-text">Seleccioná a todos los jugadores que votaron para expulsar al impostor</p>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 w-full mt-4">
        {#each players.filter(p => p.role === 'regular') as player}
          <button
            class="bg-white border-4 rounded-xl p-6 text-center shadow cursor-pointer transition-all {expellers.has(player.id) ? 'border-primary bg-blue-50' : 'border-gray-border hover:border-primary hover:bg-blue-50'}"
            on:click={() => toggleExpeller(player.id)}
          >
            <h3 class="text-xl text-gray-800">{player.name}</h3>
          </button>
        {/each}
      </div>
      {#if expellers.size === 0}
        <p class="mt-4 text-lg text-gray-text">Seleccioná al menos un jugador para continuar</p>
      {/if}
    </div>
  {:else if currentQuestionIndex === 2 && impostorExpelled === true}
    <!-- Question 3: How many rounds did the impostor survive? -->
    <div class="w-full text-center p-8 bg-gray-light rounded-xl">
      <h2 class="mb-6 text-3xl text-gray-800">¿Cuántas rondas sobrevivió el impostor?</h2>
      <div class="flex items-center justify-center gap-4">
        <button
          class="w-8 h-8 text-xl bg-danger text-white border-none rounded-full cursor-pointer font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center leading-none"
          on:click={decrementRoundsSurvived}
          disabled={roundsSurvived === 0}
        >
          −
        </button>
        <div class="px-8 py-4 text-4xl font-bold text-primary border-4 border-primary rounded-lg min-w-[120px] bg-white">
          {roundsSurvived}
        </div>
        <button
          class="w-8 h-8 text-xl bg-success text-white border-none rounded-full cursor-pointer font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center leading-none"
          on:click={incrementRoundsSurvived}
          disabled={roundsSurvived >= players.length-1}
        >
          +
        </button>
      </div>
    </div>
  {:else if currentQuestionIndex === 3 && impostorExpelled === true}
    <!-- Question 4: Did the impostor guess the word? -->
    <div class="w-full text-center p-8 bg-gray-light rounded-xl">
      <h2 class="mb-6 text-3xl text-gray-800">¿Adivinó la palabra el impostor?</h2>
      <YesNoButtons value={impostorGuessedWord} onSelect={handleImpostorGuessedWord} />
    </div>
  {/if}

  <!-- Navigation buttons -->
  <div class="flex gap-4 justify-center">
    <button
      class="px-6 py-3 text-lg bg-indigo-500 text-white border-none rounded-lg cursor-pointer font-bold transition-colors {canGoBack ? 'hover:bg-purple-700' : ''} disabled:opacity-80 disabled:cursor-not-allowed"
      disabled={!canGoBack}
      on:click={goToPreviousQuestion}
    >
      ←
    </button>
    <button
      class="px-6 py-3 text-lg bg-indigo-500 text-white border-none rounded-lg cursor-pointer font-bold transition-colors {(canGoToNextQuestion || hasNextQuestion) ? 'hover:bg-purple-700' : ''} disabled:opacity-80 disabled:cursor-not-allowed"
      disabled={!canGoToNextQuestion || !hasNextQuestion}
      on:click={goToNextQuestion}
    >
      →
    </button>
  </div>
</div>
