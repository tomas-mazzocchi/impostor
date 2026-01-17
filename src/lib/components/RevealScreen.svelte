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
  let lastRoundNumber = 0;

  // Reset when starting a new round (round number changes)
  $: if (gameState.roundNumber !== lastRoundNumber) {
    lastRoundNumber = gameState.roundNumber;
    showRoundResults = false;
    selectedWinner = null;
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
    cardVisible = false;
    currentViewingPlayerId = null;
  }

  function getCurrentPlayer() {
    if (!currentViewingPlayerId) return null;
    return getPlayerById(gameState, currentViewingPlayerId);
  }

  function getStartingPlayer() {
    if (gameState.currentPlayerIndex >= 0 && gameState.currentPlayerIndex < gameState.players.length) {
      return gameState.players[gameState.currentPlayerIndex];
    }
    return null;
  }

  function handleRoundFinished() {
    showRoundResults = true;
    selectedWinner = null;
  }

  function handleWinnerSelected(winner: 'impostor' | 'players') {
    selectedWinner = winner;
    dispatch('roundWinner', winner);
  }

  function handleContinueToNextRound() {
    showRoundResults = false;
    dispatch('nextRound');
  }

  function handleEndGame() {
    dispatch('endGame');
  }

  function getRegularPlayerWord(): string | null {
    const regularPlayer = gameState.players.find(p => p.role === 'regular');
    return regularPlayer?.word || null;
  }

  const impostor = getImpostor(gameState);
</script>

{#if showRoundResults}
  <div class="round-results-screen">
    <h1>Round {gameState.roundNumber} Results</h1>

    <div class="word-category-section">
      <div class="word-display">
        <h2>{getRegularPlayerWord()}</h2>
        <p class="category-label">({gameState.category?.name})</p>
      </div>
    </div>

    <div class="players-grid">
      {#each gameState.players as player}
        <div class="player-card" class:impostor={player.role === 'impostor'}>
          <h3>{player.name}</h3>
          <p class="player-score">Score: {player.score}</p>
          {#if player.role === 'impostor'}
            <span class="impostor-tag">IMPOSTOR</span>
          {/if}
        </div>
      {/each}
    </div>

    <div class="winner-selection">
      <h2>Who won this round?</h2>
      <div class="winner-buttons">
        <button
          class="winner-button"
          class:selected={selectedWinner === 'impostor'}
          on:click={() => handleWinnerSelected('impostor')}
        >
          Impostor
        </button>
        <button
          class="winner-button"
          class:selected={selectedWinner === 'players'}
          on:click={() => handleWinnerSelected('players')}
        >
          Regular Players
        </button>
      </div>
    </div>

    {#if selectedWinner}
      <div class="action-buttons">
        <button class="continue-button" on:click={handleContinueToNextRound}>
          Continue to Next Round
        </button>
        <button class="end-game-button" on:click={handleEndGame}>
          End Game & Show Rankings
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="reveal-screen">
    <h1>Private Reveal</h1>
    <p class="instructions">
      Each player should view their role and word privately. <strong
        >Pass the device to each player</strong
      > - they will click their own name to view their card.
    </p>

    <div class="player-selector">
      <h2>Select a player to view their role</h2>
      <div class="player-buttons">
        {#each gameState.players as player}
          <button
            class="player-button"
            class:active={currentViewingPlayerId === player.id}
            on:click={() => handleViewPlayer(player.id)}
            disabled={currentViewingPlayerId !== null &&
              currentViewingPlayerId !== player.id}
          >
            {player.name}
          </button>
        {/each}
      </div>
    </div>

    {#if currentViewingPlayerId && getCurrentPlayer()}
      {#if cardVisible}
        <div class="reveal-card">
          <h2>{getCurrentPlayer()?.name}</h2>
          <div
            class="role-badge"
            class:impostor={getCurrentPlayer()?.role === "impostor"}
          >
            {getCurrentPlayer()?.role === "impostor" ? "IMPOSTOR" : "PLAYER"}
          </div>
          <div class="info-section">
            <p class="category">
              <strong>Category:</strong>
              {gameState.category?.name}
            </p>
            {#if getCurrentPlayer()?.role !== "impostor"}
              <p class="word">
                <strong>Your word:</strong>
                {getCurrentPlayer()?.word}
              </p>
            {/if}
          </div>
          <div class="card-actions">
            <button class="continue-button-card" on:click={handleCloseCard}>
              Close my card
            </button>
          </div>
        </div>
      {/if}
    {/if}

    {#if getStartingPlayer()}
      <div class="start-game-section">
        <p class="starting-player-info">
          <strong>{getStartingPlayer()?.name}</strong> will start the game!
        </p>
        <button class="continue-button" on:click={handleRoundFinished}>
          Round Finished
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .reveal-screen {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
  }

  .instructions {
    text-align: center;
    color: #666;
    max-width: 600px;
  }

  .player-selector {
    width: 100%;
    max-width: 800px;
  }

  .player-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .player-button {
    padding: 0.75rem 1.5rem;
    background: #f5f5f5;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .player-button:hover {
    border-color: #007bff;
    background: #e7f3ff;
  }

  .player-button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .player-button.viewed {
    opacity: 0.6;
    position: relative;
  }

  .player-button.viewed::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(40, 167, 69, 0.2);
    border-radius: 8px;
    pointer-events: none;
  }

  .viewed-checkmark {
    margin-left: 0.5rem;
    color: #28a745;
    font-weight: bold;
  }

  .reveal-card {
    background: white;
    border: 3px solid #007bff;
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .reveal-card h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .role-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    background: #28a745;
    color: white;
    border-radius: 20px;
    font-weight: bold;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .role-badge.impostor {
    background: #dc3545;
  }

  .info-section {
    text-align: left;
  }

  .info-section p {
    margin: 1rem 0;
    font-size: 1.1rem;
  }

  .category {
    font-size: 1.2rem;
  }

  .word {
    font-size: 1.5rem;
    color: #007bff;
    font-weight: bold;
  }

  .word.impostor-word {
    color: #dc3545;
  }

  .hint {
    font-style: italic;
    color: #666;
    font-size: 0.9rem;
  }

  .placeholder {
    padding: 3rem;
    text-align: center;
    color: #999;
  }

  .continue-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .continue-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .start-game-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .starting-player-info {
    font-size: 1.2rem;
    text-align: center;
    color: #333;
  }

  .starting-player-info strong {
    color: #007bff;
    font-size: 1.3rem;
  }

  .card-actions {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .continue-button-card {
    padding: 0.75rem 1.5rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
  }

  .continue-button-card:hover {
    background: #5a6268;
  }

  .next-player-button {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
  }

  .next-player-button:hover {
    background: #218838;
  }

  .card-closed-message {
    background: #f5f5f5;
    border: 2px dashed #ddd;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    text-align: center;
  }

  .card-closed-message p {
    margin: 0 0 1.5rem 0;
    color: #666;
    font-size: 1rem;
  }

  .round-results-screen {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .word-category-section {
    width: 100%;
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
  }

  .word-display h2 {
    font-size: 3rem;
    margin: 0 0 0.5rem 0;
    font-weight: bold;
  }

  .category-label {
    font-size: 1.5rem;
    margin: 0;
    opacity: 0.9;
  }

  .players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .player-card {
    background: white;
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .player-card.impostor {
    border-color: #dc3545;
    background: #fff5f5;
  }

  .player-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    color: #333;
  }

  .impostor-tag {
    display: inline-block;
    background: #dc3545;
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .player-score {
    margin: 0.5rem 0 0 0;
    font-size: 1.1rem;
    color: #666;
    font-weight: bold;
  }

  .winner-selection {
    width: 100%;
    text-align: center;
    padding: 2rem;
    background: #f5f5f5;
    border-radius: 12px;
  }

  .winner-selection h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.8rem;
    color: #333;
  }

  .winner-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .winner-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: white;
    border: 3px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: bold;
  }

  .winner-button:hover {
    border-color: #007bff;
    background: #e7f3ff;
  }

  .winner-button.selected {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .end-game-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }

  .end-game-button:hover {
    background: #c82333;
  }
</style>
