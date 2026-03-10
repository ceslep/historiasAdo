<script lang="ts">
  import { X, Database, RefreshCw, Trash2, HardDrive, CloudOff, CheckCircle2, Clock, AlertTriangle } from "lucide-svelte";
  import { pacienteStore } from "../stores/pacienteStore.svelte";
  import { clearAllPacientes, getAllPacientes, type PacienteSync } from "../db/db";

  let { isOpen = $bindable(false), onClose }: { isOpen: boolean; onClose: () => void } = $props();

  let registros = $state<PacienteSync[]>([]);
  let isLoadingRegistros = $state(false);
  let isResetting = $state(false);
  let vistaActual = $state<"stats" | "registros">("stats");
  let filtroRegistros = $state<"todos" | "synced" | "pending" | "deleted">("todos");
  let busqueda = $state("");

  const stats = $derived(pacienteStore.dbStats);

  const registrosFiltrados = $derived(() => {
    let lista = registros;
    if (filtroRegistros === "synced") lista = lista.filter((r) => r.synced && !r.deleted);
    else if (filtroRegistros === "pending") lista = lista.filter((r) => !r.synced && !r.deleted);
    else if (filtroRegistros === "deleted") lista = lista.filter((r) => r.deleted);
    else lista = lista.filter((r) => !r.deleted);

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (r) =>
          r.nombres?.toLowerCase().includes(q) ||
          r.identificacion?.includes(q) ||
          r.historia?.includes(q) ||
          r.ind?.includes(q),
      );
    }
    return lista;
  });

  async function cargarRegistros() {
    isLoadingRegistros = true;
    try {
      registros = await getAllPacientes();
    } catch (e) {
      console.error("Error cargando registros:", e);
    } finally {
      isLoadingRegistros = false;
    }
  }

  async function handleRefresh() {
    await pacienteStore.sincronizar();
    await pacienteStore.actualizarStats();
    if (vistaActual === "registros") await cargarRegistros();
  }

  async function handleReset() {
    if (!confirm("¿Estás seguro? Esto eliminará todos los datos locales y los volverá a descargar.")) return;
    isResetting = true;
    try {
      await clearAllPacientes();
      await pacienteStore.sincronizar();
      await pacienteStore.actualizarStats();
      if (vistaActual === "registros") await cargarRegistros();
    } finally {
      isResetting = false;
    }
  }

  function switchToRegistros() {
    vistaActual = "registros";
    if (registros.length === 0) cargarRegistros();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      isOpen = false;
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onclick={() => { isOpen = false; onClose(); }}
      role="presentation"
    ></div>

    <!-- Modal -->
    <div class="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
            <Database class="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Estado de IndexedDB</h2>
            <p class="text-xs text-slate-500">Base de datos local offline</p>
          </div>
        </div>
        <button
          onclick={() => { isOpen = false; onClose(); }}
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Tab bar -->
      <div class="flex border-b border-slate-200 bg-white px-5">
        <button
          onclick={() => (vistaActual = "stats")}
          class="relative px-4 py-3 text-sm font-semibold transition-colors {vistaActual === 'stats' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}"
        >
          Resumen
          {#if vistaActual === "stats"}
            <span class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"></span>
          {/if}
        </button>
        <button
          onclick={switchToRegistros}
          class="relative px-4 py-3 text-sm font-semibold transition-colors {vistaActual === 'registros' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}"
        >
          Registros
          <span class="ml-1.5 inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {stats.total}
          </span>
          {#if vistaActual === "registros"}
            <span class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"></span>
          {/if}
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-5 py-5">
        {#if vistaActual === "stats"}
          <!-- Stats cards -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <HardDrive class="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{stats.total.toLocaleString("es-CO")}</p>
                <p class="text-xs text-slate-500">Total registros</p>
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 class="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emerald-700">{stats.synced.toLocaleString("es-CO")}</p>
                <p class="text-xs text-emerald-600">Sincronizados</p>
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Clock class="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-amber-700">{stats.pending.toLocaleString("es-CO")}</p>
                <p class="text-xs text-amber-600">Pendientes</p>
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <Trash2 class="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p class="text-2xl font-bold text-red-600">{stats.deleted.toLocaleString("es-CO")}</p>
                <p class="text-xs text-red-500">Eliminados</p>
              </div>
            </div>
          </div>

          <!-- Connection status -->
          <div class="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            {#if pacienteStore.isOnline}
              <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-sm font-medium text-slate-700">En línea</span>
            {:else}
              <CloudOff class="h-4 w-4 text-amber-500" />
              <span class="text-sm font-medium text-slate-700">Sin conexión — modo offline</span>
            {/if}
            {#if pacienteStore.isSyncing}
              <span class="ml-auto text-xs text-blue-600 font-semibold">Sincronizando...</span>
            {/if}
          </div>

          {#if stats.pending > 0}
            <div class="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle class="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <p class="text-sm text-amber-700">
                Hay <strong>{stats.pending}</strong> registro{stats.pending !== 1 ? "s" : ""} pendiente{stats.pending !== 1 ? "s" : ""} de sincronizar.
              </p>
            </div>
          {/if}

        {:else}
          <!-- Registros view -->
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              bind:value={busqueda}
              placeholder="Buscar por nombre, ID, historia..."
              class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div class="flex gap-1">
              {#each [
                { key: "todos", label: "Todos" },
                { key: "synced", label: "Sync" },
                { key: "pending", label: "Pend." },
                { key: "deleted", label: "Elim." },
              ] as tab}
                <button
                  onclick={() => (filtroRegistros = tab.key as typeof filtroRegistros)}
                  class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {filtroRegistros === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
                >
                  {tab.label}
                </button>
              {/each}
            </div>
          </div>

          {#if isLoadingRegistros}
            <div class="flex items-center justify-center py-12">
              <div class="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600"></div>
            </div>
          {:else if registrosFiltrados().length === 0}
            <div class="flex flex-col items-center py-12 text-center">
              <Database class="mb-3 h-10 w-10 text-slate-300" />
              <p class="text-sm text-slate-500">No se encontraron registros</p>
            </div>
          {:else}
            <div class="text-xs text-slate-500 mb-2">{registrosFiltrados().length.toLocaleString("es-CO")} registros</div>
            <div class="space-y-1.5 max-h-[40vh] overflow-y-auto">
              {#each registrosFiltrados().slice(0, 200) as reg}
                <div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm hover:bg-slate-50">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold {reg.synced && !reg.deleted ? 'bg-emerald-100 text-emerald-700' : reg.deleted ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}">
                    {reg.nombres?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-slate-800">{reg.nombres || "Sin nombre"}</p>
                    <p class="truncate text-xs text-slate-500">
                      HC: {reg.historia} · CC: {reg.identificacion} · {reg.estado}
                    </p>
                  </div>
                  <div class="shrink-0">
                    {#if reg.deleted}
                      <span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Eliminado</span>
                    {:else if reg.synced}
                      <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Sync</span>
                    {:else}
                      <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Pendiente</span>
                    {/if}
                  </div>
                </div>
              {/each}
              {#if registrosFiltrados().length > 200}
                <p class="py-2 text-center text-xs text-slate-400">
                  Mostrando 200 de {registrosFiltrados().length.toLocaleString("es-CO")} registros
                </p>
              {/if}
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
        <button
          onclick={handleReset}
          disabled={isResetting}
          class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 class="h-3.5 w-3.5" />
          {isResetting ? "Reseteando..." : "Resetear DB"}
        </button>
        <button
          onclick={handleRefresh}
          disabled={pacienteStore.isSyncing}
          class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw class="h-3.5 w-3.5 {pacienteStore.isSyncing ? 'animate-spin' : ''}" />
          Sincronizar
        </button>
      </div>
    </div>
  </div>
{/if}
