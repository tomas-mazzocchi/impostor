<script lang="ts">
  import type { GameState } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import { getPlayerById, getImpostor, getPlayersByScore } from "$lib/game/local-mode";
  import StandingsTable from "./StandingsTable.svelte";
  import HelpButton from "./HelpButton.svelte";

  export let gameState: GameState;
  export let currentViewingPlayerId: string | null = null;

  const dispatch = createEventDispatcher();
  let cardVisible = false;
  let showRoundResults = false;
  let showStandingsModal = false;
  let lastRoundNumber = 0;
  let players = gameState.players.map(player => ({ ...player, viewed: false }));
  
  // Questionnaire state
  let impostorExpelled: boolean | null = null;
  let expellers: Set<string> = new Set();
  let roundsSurvived: number | null = null;
  let impostorGuessedWord: boolean | null = null;
  let currentQuestionIndex = 0;

  // Reset when starting a new round (round number changes)
  $: if (gameState.roundNumber !== lastRoundNumber) {
    lastRoundNumber = gameState.roundNumber;
    showRoundResults = false;
    impostorExpelled = null;
    expellers = new Set();
    roundsSurvived = null;
    impostorGuessedWord = null;
    currentQuestionIndex = 0;
    players = gameState.players.map(player => ({ ...player, viewed: false }));
    cardVisible = false;
    currentViewingPlayerId = null;
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
  }

  function handleReshuffleWord() {
    // Close any open cards and reset viewed status to ensure fresh view
    players = gameState.players.map(player => ({ ...player, viewed: false }));
    cardVisible = false;
    currentViewingPlayerId = null;
    dispatch('reshuffleWord');
  }

  function handleContinueToNextRound() {
    const roundResult = {
      impostorExpelled: impostorExpelled ?? false,
      expellers: Array.from(expellers),
      roundsSurvived: roundsSurvived ?? 0,
      impostorGuessedWord: impostorGuessedWord ?? false
    };
    dispatch('recordRoundScores', roundResult);
    showRoundResults = false;
    dispatch('nextRound');
  }

  function handleEndGame() {
    const roundResult = {
      impostorExpelled: impostorExpelled ?? false,
      expellers: Array.from(expellers),
      roundsSurvived: roundsSurvived ?? 0,
      impostorGuessedWord: impostorGuessedWord ?? false
    };
    dispatch('recordRoundScores', roundResult);
    dispatch('endGame');
  }

  function getRegularPlayerWord(): string | null {
    const regularPlayer = players.find(p => p.role === 'regular');
    return regularPlayer?.word || null;
  }

  function handleImpostorExpelledSelected(expelled: boolean) {
    impostorExpelled = expelled;
  }

  function toggleExpeller(playerId: string) {
    const newExpellers = new Set(expellers);
    if (newExpellers.has(playerId)) {
      newExpellers.delete(playerId);
    } else {
      newExpellers.add(playerId);
    }
    expellers = newExpellers;
  }

  function handleRoundsSurvivedInput(value: string) {
    const num = parseInt(value, 10);
    roundsSurvived = isNaN(num) ? null : num;
  }

  function incrementRoundsSurvived() {
    if (roundsSurvived === null) {
      roundsSurvived = 1;
    } else {
      roundsSurvived++;
    }
  }

  function decrementRoundsSurvived() {
    if (roundsSurvived === null) {
      roundsSurvived = 0;
    } else if (roundsSurvived > 0) {
      roundsSurvived--;
    }
  }

  function handleImpostorGuessedWord(guessed: boolean) {
    impostorGuessedWord = guessed;
  }

  function handleShowStandings() {
    showStandingsModal = true;
  }

  function handleCloseStandings() {
    showStandingsModal = false;
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
    }
  }

  function goToNextQuestion() {
    currentQuestionIndex++;
  }

  // Reactive declarations - these recalculate automatically when dependencies change
  $: canGoToNextQuestion = (() => {
    if (currentQuestionIndex === 0) return impostorExpelled === true;
    if (currentQuestionIndex === 1) return expellers.size > 0;
    if (currentQuestionIndex === 2) return roundsSurvived !== null;
    return false;
  })();

  $: canGoBack = currentQuestionIndex > 0;

  $: hasNextQuestion = (() => {
    if (currentQuestionIndex === 0 && impostorExpelled === false) return false;
    if (currentQuestionIndex === 3) return false;
    if (impostorExpelled === false) return false;
    return true;
  })();

  $: isAllQuestionsAnswered = (() => {
    if (impostorExpelled === false) return true;
    if (impostorExpelled === true) {
      return expellers.size > 0 && roundsSurvived !== null && impostorGuessedWord !== null;
    }
    return false;
  })();

  $: rankedPlayersForModal = getPlayersByScore(gameState);
  $: highestScoreForModal = rankedPlayersForModal.length > 0 ? rankedPlayersForModal[0].score : 0;
  $: topPlayersForModal = rankedPlayersForModal.filter((player) => player.score === highestScoreForModal);

  const impostor = getImpostor(gameState);
</script>

<HelpButton />

{#if showRoundResults}
  <div class="flex flex-col gap-8 items-center w-full max-w-[1000px] mx-auto">
    <h1 class="text-center text-2xl">Resultados de la Ronda {gameState.roundNumber}</h1>

    <div class="w-full text-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white">
      <div>
        <h2 class="text-5xl font-bold mb-2">{getRegularPlayerWord()}</h2>
        <p class="text-2xl opacity-90">({gameState.category?.name})</p>
      </div>
    </div>

    {#if currentQuestionIndex === 0}
      <!-- Question 1: Was the impostor expelled? -->
      <div class="w-full text-center p-8 bg-gray-light rounded-xl">
        <h2 class="mb-6 text-3xl text-gray-800">¿Fue expulsado el impostor?</h2>
        <div class="flex gap-4 justify-center flex-wrap">
          <button
            class="px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold {impostorExpelled === true ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50'}"
            on:click={() => handleImpostorExpelledSelected(true)}
          >
            Sí
          </button>
          <button
            class="px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold {impostorExpelled === false ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50'}"
            on:click={() => handleImpostorExpelledSelected(false)}
          >
            No
          </button>
        </div>
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
            disabled={roundsSurvived === null || roundsSurvived === 0}
          >
            −
          </button>
          <div class="px-8 py-4 text-4xl font-bold text-primary border-4 border-primary rounded-lg min-w-[120px] bg-white">
            {roundsSurvived ?? 0}
          </div>
          <button
            class="w-8 h-8 text-xl bg-success text-white border-none rounded-full cursor-pointer font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center leading-none"
            on:click={incrementRoundsSurvived}
            disabled={roundsSurvived !== null && roundsSurvived >= players.length-1}
          >
            +
          </button>
        </div>
      </div>
    {:else if currentQuestionIndex === 3 && impostorExpelled === true}
      <!-- Question 4: Did the impostor guess the word? -->
      <div class="w-full text-center p-8 bg-gray-light rounded-xl">
        <h2 class="mb-6 text-3xl text-gray-800">¿Adivinó la palabra el impostor?</h2>
        <div class="flex gap-4 justify-center flex-wrap">
          <button
            class="px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold {impostorGuessedWord === true ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50'}"
            on:click={() => handleImpostorGuessedWord(true)}
          >
            Sí
          </button>
          <button
            class="px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold {impostorGuessedWord === false ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50'}"
            on:click={() => handleImpostorGuessedWord(false)}
          >
            No
          </button>
        </div>
      </div>
    {/if}

    <!-- Navigation buttons - unified for all questions -->
    <div class="flex gap-4 justify-center mt-6">
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

    <!-- Action buttons - always visible at the end -->
    <div class="w-full border-t-2 border-gray-300 pt-6">
      <div class="flex flex-col gap-4 items-center w-full">
        <button 
          class="px-6 py-3 text-lg underline border-none rounded-lg cursor-pointer font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
          on:click={handleShowStandings}
        >
          <span>Ver Posiciones</span>
          <img src="/podium.png" class="w-5 h-5" alt="Podio" />
        </button>
        <div class="flex gap-4 flex-wrap justify-center w-full">
          <button 
            class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!isAllQuestionsAnswered}
            on:click={handleContinueToNextRound}
          >
            Siguiente Ronda
          </button>
          <button 
            class="px-8 py-4 text-xl bg-danger text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isAllQuestionsAnswered}
            on:click={handleEndGame}
          >
            Terminar Juego
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Standings Modal -->
  {#if showStandingsModal}
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      role="button"
      tabindex="0"
      on:click={handleCloseStandings}
      on:keydown={(e) => e.key === 'Escape' && handleCloseStandings()}
    >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <div 
        class="bg-white rounded-2xl p-8 max-w-[600px] w-full max-h-[80vh] overflow-y-auto shadow-2xl" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="standings-title"
        on:click={(e) => e.stopPropagation()}
      >
        <h2 id="standings-title" class="text-3xl font-bold text-center mb-6 text-gray-800">Posiciones Actuales</h2>
        <span>Estas son las posiciones hasta la ronda anterior</span>
        {#if highestScoreForModal > 0}
          <div class="bg-gradient-to-br from-yellow-300 to-orange-400 p-6 rounded-2xl text-center w-full shadow-md mb-4">
            {#if topPlayersForModal.length === 1}
              <h3 class="text-2xl mb-1 text-gray-800">🏆 {topPlayersForModal[0].name} 🏆</h3>
              <p class="text-lg text-gray-700 font-bold">{topPlayersForModal[0].score} puntos</p>
            {:else}
              <h3 class="text-2xl mb-1 text-gray-800">🏆 Liderando 🏆</h3>
              <div class="flex flex-wrap gap-2 justify-center my-2">
                {#each topPlayersForModal as player}
                  <div class="bg-white/30 px-3 py-1 rounded-full text-base font-bold">
                    <span class="text-gray-800">{player.name}</span>
                  </div>
                {/each}
              </div>
              <p class="text-lg text-gray-700 font-bold">{highestScoreForModal} puntos</p>
            {/if}
          </div>
        {/if}
        
        <StandingsTable {gameState} compact={true} />

        <button
          class="mt-6 w-full px-6 py-3 text-lg bg-primary text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-blue-700"
          on:click={handleCloseStandings}
        >
          Cerrar
        </button>
      </div>
    </div>
  {/if}
{:else}
  <div class="flex flex-col gap-8 items-center">
    <h1 class="text-center text-2xl">Revelación Privada</h1>
    <p class="text-center text-gray-text max-w-[600px]">
      Cada jugador debe ver su rol y palabra en privado. <strong
        >Pasá el dispositivo a cada jugador</strong
      > - van a hacer clic en su propio nombre para ver su tarjeta.
    </p>

    <div class="w-full max-w-[800px]">
      <h2 class="text-xl mb-4">Seleccioná un jugador para ver su rol</h2>
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
            {getCurrentPlayer()?.role === "impostor" ? "IMPOSTOR" : "JUGADOR"}
          </div>
          <div class="text-left">
            <p class="my-4 text-xl">
              <strong>Categoría:</strong>
              {gameState.category?.name}
            </p>
            {#if getCurrentPlayer()?.role !== "impostor"}
              <p class="text-2xl text-primary font-bold">
                <strong>Tu palabra:</strong>
                {getCurrentPlayer()?.word}
              </p>
            {/if}
          </div>
          <div class="mt-6 flex gap-4 flex-col">
            <button 
              class="px-6 py-3 bg-gray-600 text-white border-none rounded-lg text-base font-bold cursor-pointer transition-colors hover:bg-gray-700 w-full"
              on:click={handleCloseCard}
            >
              Cerrar mi tarjeta
            </button>
          </div>
        </div>
      {/if}
    {/if}

    {#if startingPlayer}
      <div class="flex flex-col items-center gap-4 mt-8">
        <p class="text-xl text-center text-gray-800">
          <strong class="text-primary text-2xl">{startingPlayer.name}</strong> va a empezar el juego!
        </p>
        <div class="flex gap-4 flex-wrap justify-center w-full">
          <button 
            class="px-8 py-4 text-xl bg-gray-600 text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-gray-700"
            on:click={handleReshuffleWord}
          >
            🔀 Cambiar Palabra
          </button>
          <button 
            class="px-8 py-4 text-xl bg-success text-white border-none rounded-lg cursor-pointer"
            on:click={handleRoundFinished}
          >
            Ronda Terminada
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}
