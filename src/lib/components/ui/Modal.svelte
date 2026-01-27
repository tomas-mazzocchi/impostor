<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title = '';
  export let maxWidth = '600px';

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if open}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
    role="button"
    tabindex="0"
    on:click={handleClose}
    on:keydown={handleKeydown}
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div 
      class="bg-white rounded-2xl p-8 w-full max-h-[85vh] overflow-y-auto shadow-2xl" 
      style="max-width: {maxWidth}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      on:click={(e) => e.stopPropagation()}
    >
      {#if title}
        <h2 id="modal-title" class="text-3xl font-bold text-center mb-6 text-gray-800">
          {title}
        </h2>
      {/if}
      
      <slot />
    </div>
  </div>
{/if}
