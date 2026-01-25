<script lang="ts">
  let showHelpModal = false;

  function openHelp() {
    showHelpModal = true;
  }

  function closeHelp() {
    showHelpModal = false;
  }
</script>

<button
  class="fixed top-4 right-4 w-10 h-10 bg-primary text-white border-none rounded-full cursor-pointer font-bold text-lg transition-colors hover:bg-blue-700 flex items-center justify-center z-40 shadow-lg"
  on:click={openHelp}
  aria-label="Help"
>
  ?
</button>

{#if showHelpModal}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
    role="button"
    tabindex="0"
    on:click={closeHelp}
    on:keydown={(e) => e.key === 'Escape' && closeHelp()}
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div 
      class="bg-white rounded-2xl p-8 max-w-[700px] w-full max-h-[85vh] overflow-y-auto shadow-2xl" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      on:click={(e) => e.stopPropagation()}
    >
      <h2 id="help-title" class="text-3xl font-bold text-center mb-6 text-gray-800">Scoring System</h2>
      
      <div class="space-y-6">
        <section>
          <h3 class="text-2xl font-bold text-danger mb-3">🎭 Impostor Points</h3>
          <ul class="space-y-2 ml-4">
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+1</span>
              <span>per round survived (without being expelled)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+5</span>
              <span>if wins by not being discovered (reaches the end without expulsion)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+3</span>
              <span>if expelled but guesses the word correctly</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="text-2xl font-bold text-success mb-3">👥 Regular Players Points</h3>
          <ul class="space-y-2 ml-4">
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+2</span>
              <span>if the group correctly expels an impostor</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+1</span>
              <span>if your vote was correct (you voted for the impostor and they were expelled)</span>
            </li>
          </ul>
        </section>

        <section class="bg-gray-100 p-4 rounded-lg">
          <h3 class="text-xl font-bold text-gray-800 mb-2">🎯 Game Objective</h3>
          <p class="text-gray-700">
            <strong>Impostor:</strong> Blend in without being discovered or guess the secret word.
          </p>
          <p class="text-gray-700 mt-2">
            <strong>Regular Players:</strong> Identify and expel the impostor while protecting the secret word.
          </p>
        </section>
      </div>

      <button
        class="mt-6 w-full px-6 py-3 text-lg bg-primary text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-blue-700"
        on:click={closeHelp}
      >
        Got it!
      </button>
    </div>
  </div>
{/if}
