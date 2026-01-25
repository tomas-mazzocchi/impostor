<script lang="ts">
  import type { GameState } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import { getPlayerById, getImpostor } from "$lib/game/local-mode";

  export let gameState: GameState;
  export let currentViewingPlayerId: string | null = null;

  const dispatch = createEventDispatcher();
  let cardVisible = false;
  let showRoundResults = false;
  let selectedWinner: 'impostor' | 'players' | null = null;
  let previouslyRecordedWinner: 'impostor' | 'players' | null = null;
  let lastRoundNumber = 0;
  let players = gameState.players.map(player => ({ ...player, viewed: false }));

  // Reset when starting a new round (round number changes)
  $: if (gameState.roundNumber !== lastRoundNumber) {
    lastRoundNumber = gameState.roundNumber;
    showRoundResults = false;
    selectedWinner = null;
    previouslyRecordedWinner = null;
  }

  function handleViewPlayer(playerId: string) {
    if (currentViewingPlayerId === playerId) {
      handleCloseCard();
      return;
    }
    currentViewingPlayerId = playerId;
    cardVisible = true;
  }

  function handleCloseCard() {
    players = players.map(p => p.id === currentViewingPlayerId ? { ...p, viewed: true } : p);
    cardVisible = false;
    currentViewingPlayerId = null;
  }

  function getCurrentPlayer() {
    if (!currentViewingPlayerId) return null;
    return getPlayerById(gameState, currentViewingPlayerId);
  }

  $: startingPlayer = (() => {
    if (gameState.currentPlayerIndex >= 0 && gameState.currentPlayerIndex < players.length) {
      return players[gameState.currentPlayerIndex];
    }
    return null;
  })();

  function handleRoundFinished() {
    showRoundResults = true;
    selectedWinner = null;
  }

  function handleReshuffleWord() {
    // Close any open cards to ensure fresh view
    cardVisible = false;
    currentViewingPlayerId = null;
    dispatch('reshuffleWord');
  }

  function handleWinnerSelected(winner: 'impostor' | 'players') {
    selectedWinner = winner;
    
    // Only record if this is a different selection than what was previously recorded
    if (previouslyRecordedWinner !== winner) {
      // If there was a previously recorded winner, reverse it first
      if (previouslyRecordedWinner !== null) {
        dispatch('reverseRoundWinner', previouslyRecordedWinner);
      }
      
      // Record the new winner
      dispatch('roundWinner', winner);
      previouslyRecordedWinner = winner;
    }
  }

  function handleContinueToNextRound() {
    showRoundResults = false;
    dispatch('nextRound');
  }

  function handleEndGame() {
    dispatch('endGame');
  }

  function getRegularPlayerWord(): string | null {
    const regularPlayer = players.find(p => p.role === 'regular');
    return regularPlayer?.word || null;
  }

  const impostor = getImpostor(gameState);
</script>

{#if showRoundResults}
  <div class="flex flex-col gap-8 items-center w-full max-w-[1000px] mx-auto">
    <h1 class="text-center text-2xl">Round {gameState.roundNumber} Results</h1>

    <div class="w-full text-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white">
      <div>
        <h2 class="text-5xl font-bold mb-2">{getRegularPlayerWord()}</h2>
        <p class="text-2xl opacity-90">({gameState.category?.name})</p>
      </div>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 w-full">
      {#each players as player}
        <div class="bg-white border-2 rounded-xl p-6 text-center shadow {player.role === 'impostor' ? 'border-danger bg-red-50' : 'border-gray-border'}">
          <h3 class="mb-2 text-xl text-gray-800">{player.name}</h3>
          <p class="mt-2 text-lg text-gray-text font-bold">Score: {player.score}</p>
          {#if player.role === 'impostor'}
            <span class="inline-block bg-danger text-white px-4 py-2 rounded-full text-sm font-bold mt-2">IMPOSTOR</span>
          {/if}
        </div>
      {/each}
    </div>

    <div class="w-full text-center p-8 bg-gray-light rounded-xl">
      <h2 class="mb-6 text-3xl text-gray-800">Who won this round?</h2>
      <div class="flex gap-4 justify-center flex-wrap">
        <button
          class="px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold {selectedWinner === 'impostor' ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50'}"
          on:click={() => handleWinnerSelected('impostor')}
        >
          Impostor
        </button>
        <button
          class="px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold {selectedWinner === 'players' ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50'}"
          on:click={() => handleWinnerSelected('players')}
        >
          Regular Players
        </button>
      </div>
    </div>

    {#if selectedWinner}
      <div class="flex gap-4 flex-wrap justify-center w-full">
        <button 
          class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer font-bold"
          on:click={handleContinueToNextRound}
        >
          Continue to Next Round
        </button>
        <button 
          class="px-8 py-4 text-xl bg-danger text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-red-700"
          on:click={handleEndGame}
        >
          End Game & Show Rankings
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex flex-col gap-8 items-center">
    <h1 class="text-center text-2xl">Private Reveal</h1>
    <p class="text-center text-gray-text max-w-[600px]">
      Each player should view their role and word privately. <strong
        >Pass the device to each player</strong
      > - they will click their own name to view their card.
    </p>

    <div class="w-full max-w-[800px]">
      <h2 class="text-xl mb-4">Select a player to view their role</h2>
      <div class="flex flex-wrap gap-2 justify-center">
        {#each players as player}
          <button
            class="px-6 py-3 rounded-lg text-base transition-all border-2 {player.viewed ? 'bg-gray-light border-gray-border cursor-not-allowed' : ' border-primary  bg-blue-50 cursor-pointer'}"
            on:click={() => handleViewPlayer(player.id)}
            disabled={(currentViewingPlayerId !== null &&
              currentViewingPlayerId !== player.id || player.viewed)}
          >
            {player.name}
          </button>
        {/each}
      </div>
    </div>

    {#if currentViewingPlayerId && getCurrentPlayer()}
      {#if cardVisible}
        <div class="bg-white border-4 {getCurrentPlayer()?.role === 'impostor' ? 'border-danger' : 'border-primary'} rounded-2xl p-8 max-w-[500px] text-center shadow-md">
          <h2 class="mb-4 text-2xl">{getCurrentPlayer()?.name}</h2>
          <div
            class="inline-block px-6 py-2 rounded-full font-bold mb-6 text-lg text-white {getCurrentPlayer()?.role === 'impostor' ? 'bg-danger' : 'bg-success'}"
          >
            {getCurrentPlayer()?.role === "impostor" ? "IMPOSTOR" : "PLAYER"}
          </div>
          <div class="text-left">
            <p class="my-4 text-xl">
              <strong>Category:</strong>
              {gameState.category?.name}
            </p>
            {#if getCurrentPlayer()?.role !== "impostor"}
              <p class="text-2xl text-primary font-bold">
                <strong>Your word:</strong>
                {getCurrentPlayer()?.word}
              </p>
            {/if}
          </div>
          <div class="mt-6 flex gap-4 flex-col">
            <button 
              class="px-6 py-3 bg-gray-600 text-white border-none rounded-lg text-base font-bold cursor-pointer transition-colors hover:bg-gray-700 w-full"
              on:click={handleCloseCard}
            >
              Close my card
            </button>
          </div>
        </div>
      {/if}
    {/if}

    {#if startingPlayer}
      <div class="flex flex-col items-center gap-4 mt-8">
        <p class="text-xl text-center text-gray-800">
          <strong class="text-primary text-2xl">{startingPlayer.name}</strong> will start the game!
        </p>
        <div class="flex gap-4 flex-wrap justify-center w-full">
          <button 
            class="px-8 py-4 text-xl bg-gray-600 text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-gray-700"
            on:click={handleReshuffleWord}
          >
            🔀 Reshuffle Word
          </button>
          <button 
            class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer"
            on:click={handleRoundFinished}
          >
            Round Finished
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}
