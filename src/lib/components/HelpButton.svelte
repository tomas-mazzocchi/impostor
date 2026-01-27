<script lang="ts">
  import Modal from "./ui/Modal.svelte";
  import Button from "./ui/Button.svelte";

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

<Modal open={showHelpModal} title="Sistema de Puntuación" maxWidth="700px" on:close={closeHelp}>
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

  <div class="mt-6">
    <Button variant="primary" size="lg" on:click={closeHelp}>
      ¡Entendido!
    </Button>
  </div>
</Modal>
