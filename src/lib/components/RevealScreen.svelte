<script lang="ts">
  import type { GameState } from "$lib/game/types";
  import { createEventDispatcher } from "svelte";
  import { getPlayerById, getImpostor, getPlayersByScore } from "$lib/game/local-mode";
  import StandingsTable from "./StandingsTable.svelte";
  import HelpButton from "./HelpButton.svelte";
  import Modal from "./ui/Modal.svelte";
  import Button from "./ui/Button.svelte";
  import LeaderBanner from "./ui/LeaderBanner.svelte";
  import PlayerCard from "./PlayerCard.svelte";
  import RoundQuestionnaire from "./RoundQuestionnaire.svelte";

  export let gameState: GameState;
  export let currentViewingPlayerId: string | null = null;

  const dispatch = createEventDispatcher();
  let cardVisible = false;
  let showRoundResults = false;
  let showStandingsModal = false;
  let lastRoundNumber = 0;
  let players = gameState.players.map(player => ({ ...player, viewed: false }));
  let isQuestionnaireComplete = false;
  
  let questionnaireComponent: RoundQuestionnaire;

  // Reset when starting a new round (round number changes)
  $: if (gameState.roundNumber !== lastRoundNumber) {
    lastRoundNumber = gameState.roundNumber;
    showRoundResults = false;
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
    players = gameState.players.map(player => ({ ...player, viewed: false }));
    cardVisible = false;
    currentViewingPlayerId = null;
    dispatch('reshuffleWord');
  }

  function handleContinueToNextRound() {
    const roundResult = questionnaireComponent.getRoundResult();
    dispatch('recordRoundScores', roundResult);
    showRoundResults = false;
    dispatch('nextRound');
  }

  function handleEndGame() {
    const roundResult = questionnaireComponent.getRoundResult();
    dispatch('recordRoundScores', roundResult);
    dispatch('endGame');
  }

  function getRegularPlayerWord(): string | null {
    const regularPlayer = players.find(p => p.role === 'regular');
    return regularPlayer?.word || null;
  }

  function handleShowStandings() {
    showStandingsModal = true;
  }

  function handleCloseStandings() {
    showStandingsModal = false;
  }

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

    <RoundQuestionnaire bind:this={questionnaireComponent} bind:isComplete={isQuestionnaireComplete} {players} />

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
          <Button
            variant="success"
            size="xl"
            disabled={!isQuestionnaireComplete}
            on:click={handleContinueToNextRound}
          >
            Siguiente Ronda
          </Button>
          <Button
            variant="danger"
            size="xl"
            disabled={!isQuestionnaireComplete}
            on:click={handleEndGame}
          >
            Terminar Juego
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Standings Modal -->
  <Modal open={showStandingsModal} title="Posiciones Actuales" on:close={handleCloseStandings}>
    <span class="block mb-4 text-center">Estas son las posiciones hasta la ronda anterior</span>
    {#if highestScoreForModal > 0}
      <div class="mb-4">
        <LeaderBanner leaders={topPlayersForModal} score={highestScoreForModal} />
      </div>
    {/if}
    
    <StandingsTable {gameState} compact={true} />

    <div class="mt-6">
      <Button variant="primary" size="lg" on:click={handleCloseStandings}>
        Cerrar
      </Button>
    </div>
  </Modal>
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

    {#if currentViewingPlayerId && cardVisible}
      {@const currentPlayer = getCurrentPlayer()}
      {#if currentPlayer}
        <PlayerCard 
          player={currentPlayer}
          categoryName={gameState.category?.name || ''}
          onClose={handleCloseCard}
        />
      {/if}
    {/if}

    {#if startingPlayer}
      <div class="flex flex-col items-center gap-4 mt-8">
        <p class="text-xl text-center text-gray-800">
          <strong class="text-primary text-2xl">{startingPlayer.name}</strong> va a empezar el juego!
        </p>
        <div class="flex gap-4 flex-wrap justify-center w-full">
          <Button variant="secondary" size="xl" on:click={handleReshuffleWord}>
            🔀 Cambiar Palabra
          </Button>
          <Button variant="success" size="xl" on:click={handleRoundFinished}>
            Ronda Terminada
          </Button>
        </div>
      </div>
    {/if}
  </div>
{/if}
