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

<div class="final-results-screen">
  <h1>Final Rankings</h1>

  <div class="winner-announcement">
    {#if winners.length === 1}
      <h2>🏆 Winner: {winners[0].name} 🏆</h2>
      <p class="winner-score">Final Score: {winners[0].score} points</p>
    {:else}
      <h2>🏆 Winners 🏆</h2>
      <div class="winners-list">
        {#each winners as winner}
          <div class="winner-item">
            <span class="winner-name">{winner.name}</span>
          </div>
        {/each}
      </div>
      <p class="winner-score">Final Score: {highestScore} points</p>
    {/if}
  </div>

  <div class="rankings-list">
    {#each rankedPlayers as player, index}
      <div class="ranking-item" class:first={player.score === highestScore}>
        <div class="rank-number">
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
        <div class="player-info">
          <h3>{player.name}</h3>
          <p class="player-score">Score: {player.score}</p>
        </div>
      </div>
    {/each}
  </div>

  <button class="new-game-button" on:click={() => dispatch('newGame')}>
    New Game
  </button>
</div>

<style>
  .final-results-screen {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    font-size: 2.5rem;
    color: #333;
  }

  .winner-announcement {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    width: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .winner-announcement h2 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .winner-score {
    font-size: 1.5rem;
    margin: 0.5rem 0 0 0;
    color: #555;
    font-weight: bold;
  }

  .winners-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin: 1rem 0;
  }

  .winner-item {
    background: rgba(255, 255, 255, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .winner-name {
    color: #333;
  }

  .rankings-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 2px solid #ddd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .ranking-item.first {
    border-color: #f6d365;
    background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
    box-shadow: 0 4px 8px rgba(246, 211, 101, 0.3);
  }

  .rank-number {
    font-size: 2rem;
    font-weight: bold;
    min-width: 60px;
    text-align: center;
  }

  .player-info {
    flex: 1;
  }

  .player-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    color: #333;
  }

  .player-score {
    margin: 0;
    font-size: 1.1rem;
    color: #666;
    font-weight: bold;
  }

  .new-game-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }

  .new-game-button:hover {
    background: #0056b3;
  }
</style>
