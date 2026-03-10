<script lang="ts">
  interface Props {
    variant?: "success" | "warning" | "error" | "neutral" | "info";
    size?: "sm" | "md";
    children?: import("svelte").Snippet;
    text?: string;
  }

  let { variant = "neutral", size = "md", children, text }: Props = $props();

  const variants = {
    success:
      "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200/60 shadow-sm shadow-emerald-100/50",
    warning:
      "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200/60 shadow-sm shadow-amber-100/50",
    error:
      "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200/60 shadow-sm shadow-red-100/50",
    neutral:
      "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 border-slate-200/60 shadow-sm shadow-slate-100/50",
    info: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200/60 shadow-sm shadow-blue-100/50",
  };

  const dots = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-slate-400",
    info: "bg-blue-500",
  };

  const pulseDot = $derived(variant === "success" || variant === "error");

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-sm gap-1.5",
  };
</script>

<span
  class="inline-flex items-center rounded-full border font-medium transition-all {variants[variant]} {sizes[size]}"
>
  <span class="relative flex h-1.5 w-1.5 shrink-0">
    {#if pulseDot}
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 {dots[variant]}"></span>
    {/if}
    <span class="relative inline-flex h-1.5 w-1.5 rounded-full {dots[variant]}"></span>
  </span>
  {#if children}
    {@render children()}
  {:else}
    {text}
  {/if}
</span>
