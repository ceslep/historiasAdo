<script lang="ts">
  let { message = "Cargando..." }: { message?: string } = $props();

  const logoUrl = `${import.meta.env.BASE_URL}icons.png`;
</script>

<div
  class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/60 overflow-hidden"
>
  <!-- Decorative floating shapes -->
  <div class="pointer-events-none absolute inset-0">
    <div
      class="absolute left-[10%] top-[20%] h-32 w-32 rounded-full bg-blue-200/20 blur-2xl"
      style="animation: float-slow 8s ease-in-out infinite;"
    ></div>
    <div
      class="absolute right-[15%] top-[30%] h-24 w-24 rounded-full bg-indigo-200/20 blur-2xl"
      style="animation: float-slow 6s ease-in-out infinite 1s;"
    ></div>
    <div
      class="absolute bottom-[25%] left-[20%] h-28 w-28 rounded-full bg-blue-100/30 blur-2xl"
      style="animation: float-slow 7s ease-in-out infinite 2s;"
    ></div>
    <div
      class="absolute bottom-[35%] right-[25%] h-20 w-20 rounded-full bg-indigo-100/25 blur-2xl"
      style="animation: float-slow 9s ease-in-out infinite 0.5s;"
    ></div>
  </div>

  <!-- Logo with glow + orbital ring -->
  <div class="relative mb-8">
    <!-- Glow behind logo -->
    <div
      class="absolute inset-0 -m-4 rounded-3xl bg-blue-500/15 blur-xl"
      style="animation: pulse-ring 2.5s ease-in-out infinite;"
    ></div>
    <!-- Outer orbital ring -->
    <div
      class="absolute inset-0 -m-6 rounded-full border-2 border-dashed border-blue-300/30"
      style="animation: spin-smooth 12s linear infinite;"
    ></div>
    <!-- Orbital dot -->
    <div
      class="absolute -m-6 h-full w-full"
      style="animation: spin-smooth 3s linear infinite;"
    >
      <div class="absolute left-1/2 top-0 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-400/50"></div>
    </div>

    <!-- Icon container -->
    <div
      class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-600/30 ring-4 ring-blue-100/50 ring-offset-2"
    >
      <img src={logoUrl} alt="HistoriasAdo" class="h-11 w-11 object-contain drop-shadow-sm" />
    </div>
  </div>

  <!-- App name with gradient -->
  <h1 class="mb-1 text-2xl font-bold gradient-text">HistoriasAdo</h1>
  <p class="text-sm font-medium text-slate-500">{message}</p>

  <!-- Wave dots -->
  <div class="mt-6 flex gap-2">
    {#each [0, 1, 2, 3] as i}
      <div
        class="h-2 w-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm shadow-blue-400/30"
        style="animation: wave-dot 1.4s ease-in-out infinite; animation-delay: {i * 0.15}s;"
      ></div>
    {/each}
  </div>
</div>

<style>
  @keyframes float-slow {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  @keyframes wave-dot {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-8px); opacity: 1; }
  }
</style>
