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
  aria-label="Ayuda"
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
      <h2 id="help-title" class="text-3xl font-bold text-center mb-6 text-gray-800">Sistema de Puntuación</h2>
      
      <div class="space-y-6">
        <section>
          <h3 class="text-2xl font-bold text-danger mb-3">🎭 Puntos del Impostor</h3>
          <ul class="space-y-2 ml-4">
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+1</span>
              <span>por ronda sobrevivida (sin ser expulsado)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+5</span>
              <span>si gana sin ser descubierto (llega al final sin expulsión)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+2</span>
              <span>si lo expulsan pero adivina la palabra</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="text-2xl font-bold text-success mb-3">👥 Puntos de Jugadores Normales</h3>
          <ul class="space-y-2 ml-4">
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+2</span>
              <span>si el grupo expulsa correctamente al impostor</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary font-bold">+1</span>
              <span>si tu voto fue correcto (votaste al impostor y fue expulsado)</span>
            </li>
          </ul>
        </section>

        <section class="bg-gray-100 p-4 rounded-lg">
          <h3 class="text-xl font-bold text-gray-800 mb-2">🎯 Objetivo del Juego</h3>
          <p class="text-gray-700">
            <strong>Impostor:</strong> Pasar desapercibido sin ser descubierto o adivinar la palabra secreta.
          </p>
          <p class="text-gray-700 mt-2">
            <strong>Jugadores Normales:</strong> Identificar y expulsar al impostor mientras protegen la palabra secreta.
          </p>
        </section>
      </div>

      <button
        class="mt-6 w-full px-6 py-3 text-lg bg-primary text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-blue-700"
        on:click={closeHelp}
      >
        ¡Entendido!
      </button>
    </div>
  </div>
{/if}
