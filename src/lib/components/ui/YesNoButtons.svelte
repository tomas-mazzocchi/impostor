<script lang="ts">
  export let value: boolean | null = null;
  export let yesLabel = 'Sí';
  export let noLabel = 'No';
  export let onSelect: (selected: boolean) => void;

  function handleSelect(selected: boolean) {
    onSelect(selected);
  }

  const selectedClasses = 'bg-primary text-white border-primary';
  const unselectedClasses = 'bg-white text-black border-gray-border hover:border-primary hover:bg-blue-50';
  const baseClasses = 'px-8 py-4 text-xl border-4 rounded-lg cursor-pointer transition-all font-bold';
</script>

<div class="flex gap-4 justify-center flex-wrap">
  <button
    class="{baseClasses} {value === true ? selectedClasses : unselectedClasses}"
    on:click={() => handleSelect(true)}
  >
    {yesLabel}
  </button>
  <button
    class="{baseClasses} {value === false ? selectedClasses : unselectedClasses}"
    on:click={() => handleSelect(false)}
  >
    {noLabel}
  </button>
</div>
