<script lang="ts">
  export let variant: 'primary' | 'danger' | 'success' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  export let disabled = false;
  export let type: 'button' | 'submit' = 'button';

  const baseClasses = 'border-none rounded-lg cursor-pointer font-bold transition-colors';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    danger: 'bg-danger text-white hover:bg-red-700',
    success: 'bg-success text-white hover:bg-green-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  const disabledClasses = 'disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50';
  
  $: classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`;
</script>

<button
  {type}
  {disabled}
  class={classes}
  on:click
>
  <slot />
</button>
