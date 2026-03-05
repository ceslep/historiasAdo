<script lang="ts">
  import { onMount } from "svelte";
  import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-svelte";
  import { pacienteStore } from "../stores/pacienteStore.svelte";

  let isOnline = $state(true);
  let pendingSync = $state(0);
  let isSyncing = $state(false);
  let justConnected = $state(false);
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function handleOnline() {
    isOnline = true;
    justConnected = true;
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      justConnected = false;
    }, 3000);
  }

  function handleOffline() {
    isOnline = false;
    justConnected = false;
  }

  async function handleSync() {
    isSyncing = true;
    try {
      await pacienteStore.sincronizar();
    } finally {
      isSyncing = false;
    }
  }

  onMount(() => {
    isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(() => {
      isOnline = navigator.onLine;
      pendingSync = pacienteStore.pendingSyncCount;
    }, 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  });
</script>

{#if !isOnline}
  <!-- Offline banner -->
  <div class="animate-toast fixed left-0 right-0 top-0 z-[60] px-3 pt-2 sm:px-4">
    <div
      class="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 shadow-lg shadow-amber-500/25 border border-amber-400/30"
    >
      <div class="flex items-center gap-2.5 text-white">
        <div
          class="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        >
          <WifiOff class="h-3.5 w-3.5" />
          <span class="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50"></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
          </span>
        </div>
        <div>
          <span class="text-sm font-bold">Sin conexión</span>
          <span class="hidden text-xs opacity-80 sm:inline ml-1.5"
            >· Trabajando en modo local</span
          >
        </div>
      </div>
      {#if pendingSync > 0}
        <span
          class="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white border border-white/10"
        >
          {pendingSync} pendiente{pendingSync !== 1 ? "s" : ""}
        </span>
      {/if}
    </div>
  </div>
{:else if pendingSync > 0}
  <!-- Syncing banner -->
  <div class="animate-toast fixed left-0 right-0 top-0 z-[60] px-3 pt-2 sm:px-4">
    <div
      class="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 shadow-lg shadow-blue-600/25 border border-blue-500/30 overflow-hidden relative"
    >
      <!-- Animated progress bar -->
      <div class="absolute bottom-0 left-0 h-0.5 w-full bg-white/10">
        <div
          class="h-full bg-white/40 rounded-full"
          style="animation: sync-progress 2s ease-in-out infinite; width: 40%;"
        ></div>
      </div>

      <div class="flex items-center gap-2.5 text-white">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <RefreshCw class="h-3.5 w-3.5 {isSyncing ? 'animate-spin' : ''}" />
        </div>
        <div>
          <span class="text-sm font-bold">Sincronizando</span>
          <span class="hidden text-xs opacity-80 sm:inline ml-1.5"
            >· {pendingSync} cambio{pendingSync !== 1 ? "s" : ""}</span
          >
        </div>
      </div>
      <button
        onclick={handleSync}
        disabled={isSyncing}
        class="rounded-xl bg-white/20 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold text-white border border-white/10 transition-all hover:bg-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        Sincronizar
      </button>
    </div>
  </div>
{:else if justConnected}
  <!-- Connected toast -->
  <div class="animate-toast fixed left-0 right-0 top-0 z-[60] px-3 pt-2 sm:px-4">
    <div
      class="mx-auto flex max-w-3xl items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 shadow-lg shadow-emerald-500/25 border border-emerald-400/30"
    >
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <CheckCircle2 class="h-4 w-4 text-white animate-bounce-in" />
      </div>
      <span class="text-sm font-bold text-white">Conectado · Datos sincronizados</span>
    </div>
  </div>
{/if}

<style>
  @keyframes sync-progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
</style>
