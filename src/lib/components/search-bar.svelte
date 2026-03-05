<script lang="ts">
  import {
    Search,
    X,
    SlidersHorizontal,
    Menu,
    CheckCircle2,
    Keyboard,
  } from "lucide-svelte";

  type FiltroEstado = "todos" | "ACTIVO" | "INACTIVO";

  interface Props {
    query: string;
    filtroEstado: FiltroEstado;
    totalResultados: number;
    seleccionadosCount: number;
    onQueryChange: (q: string) => void;
    onFiltroChange: (f: FiltroEstado) => void;
    onOpenFieldSelector: () => void;
    onOpenSidebar: () => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
  }

  let {
    query = $bindable(),
    filtroEstado = $bindable(),
    totalResultados,
    seleccionadosCount = 0,
    onQueryChange,
    onFiltroChange,
    onOpenFieldSelector,
    onOpenSidebar,
    onSelectAll,
    onClearSelection,
  }: Props = $props();

  let inputValue = $state(query);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isFocused = $state(false);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (inputValue.length >= 3) {
      debounceTimer = setTimeout(() => onQueryChange(inputValue), 300);
    } else if (inputValue.length === 0) {
      onQueryChange("");
    }
  }

  function clearInput() {
    inputValue = "";
    onQueryChange("");
  }

  const filtros: { value: FiltroEstado; label: string; color: string }[] = [
    { value: "todos", label: "Todos", color: "from-slate-500 to-slate-600" },
    { value: "ACTIVO", label: "Activos", color: "from-emerald-500 to-green-600" },
    { value: "INACTIVO", label: "Inactivos", color: "from-slate-400 to-slate-500" },
  ];
</script>

<div class="space-y-3">
  <!-- Search input card -->
  <div
    class="relative rounded-2xl transition-all duration-300 {isFocused
      ? 'ring-4 ring-blue-500/10 shadow-lg shadow-blue-200/30'
      : 'shadow-sm'}"
  >
    <!-- Left icon -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10"
    >
      <Search
        class="h-5 w-5 transition-all duration-200 {isFocused
          ? 'text-blue-500 scale-110'
          : 'text-slate-400'}"
      />
    </div>

    <input
      type="text"
      value={inputValue}
      oninput={handleInput}
      onfocus={() => (isFocused = true)}
      onblur={() => (isFocused = false)}
      placeholder="Buscar paciente – nombre, identificación, historia..."
      class="w-full rounded-2xl border-1.5 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300
        {isFocused
        ? 'border-blue-400 bg-white'
        : 'border-slate-200 hover:border-slate-300'}"
      style="box-shadow: {isFocused ? '0 0 0 1px rgba(96,165,250,0.3)' : '0 1px 3px rgba(0,0,0,.05)'};"
    />

    <!-- Right: min-chars hint OR clear button -->
    {#if inputValue.length > 0 && inputValue.length < 3}
      <div class="absolute inset-y-0 right-4 flex items-center">
        <span
          class="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-2.5 py-0.5 text-xs font-semibold text-amber-600 shadow-sm"
        >
          <Keyboard class="h-3 w-3" />
          +{3 - inputValue.length}
        </span>
      </div>
    {:else if inputValue.length >= 3}
      <button
        onclick={clearInput}
        class="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-all"
        aria-label="Limpiar búsqueda"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <X class="h-3.5 w-3.5" />
        </span>
      </button>
    {/if}
  </div>

  <!-- Filters + Actions row -->
  <div class="flex flex-wrap items-center gap-2">
    <!-- Estado pill tabs -->
    <div class="flex items-center rounded-xl bg-slate-100/80 p-1 gap-0.5 border border-slate-200/60">
      {#each filtros as filtro}
        <button
          onclick={() => onFiltroChange(filtro.value)}
          class="relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200
            {filtroEstado === filtro.value
            ? 'bg-gradient-to-r ' + filtro.color + ' text-white shadow-md'
            : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}"
        >
          {filtro.label}
        </button>
      {/each}
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Sidebar trigger (mobile) -->
    <button
      onclick={onOpenSidebar}
      class="relative flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:scale-105 active:scale-95 lg:hidden"
    >
      <Menu class="h-4 w-4" />
      {#if seleccionadosCount > 0}
        <span
          class="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 text-xs font-bold text-white shadow-sm shadow-blue-400/30"
        >
          {seleccionadosCount}
        </span>
      {:else}
        <span>Panel</span>
      {/if}
    </button>

    <!-- Select all -->
    {#if totalResultados > 0}
      <button
        onclick={onSelectAll}
        class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:shadow-sm hover:scale-105 active:scale-95"
      >
        <CheckCircle2 class="h-4 w-4" />
        <span class="hidden sm:inline">Seleccionar</span> todos
      </button>
    {/if}

    <!-- Clear selection -->
    {#if seleccionadosCount > 0}
      <button
        onclick={onClearSelection}
        class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:bg-red-50 hover:shadow-sm hover:scale-105 active:scale-95"
      >
        <X class="h-4 w-4" />
        Limpiar
      </button>
    {/if}

    <!-- Columns picker -->
    <button
      onclick={onOpenFieldSelector}
      class="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:scale-105 active:scale-95"
    >
      <SlidersHorizontal class="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
      <span class="hidden sm:inline">Columnas</span>
    </button>

    <!-- Result count chip -->
    {#if totalResultados > 0}
      <div class="flex items-center gap-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 px-3 py-1.5 ml-1">
        <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
        <span class="text-xs font-medium text-slate-500">
          <span class="font-bold text-slate-800">{totalResultados}</span>
          {totalResultados !== 1 ? " resultados" : " resultado"}
        </span>
      </div>
    {/if}
  </div>
</div>
