<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import SearchBar from "./lib/components/search-bar.svelte";
  import PatientList from "./lib/components/patient-list.svelte";
  import FieldSelectorModal from "./lib/components/field-selector-modal.svelte";
  import SelectedPatientsSidebar from "./lib/components/selected-patients-sidebar.svelte";
  import PdfPreviewModal from "./lib/components/pdf-preview-modal.svelte";
  import HistorialModal from "./lib/components/historial-modal.svelte";
  import LoadingScreen from "./lib/components/loading-screen.svelte";
  import OfflineStatus from "./lib/components/offline-status.svelte";
  import DbStatusModal from "./lib/components/db-status-modal.svelte";
  import OnboardingTour from "./lib/components/onboarding-tour.svelte";
  import { pacienteStore } from "./lib/stores/pacienteStore.svelte";
  import type { Paciente } from "./lib/types/paciente";
  import { Search, AlertCircle, Sparkles, HelpCircle, Database } from "lucide-svelte";

  const logoUrl = `${import.meta.env.BASE_URL}icons.png`;

  let resultados = $state<Paciente[]>([]);
  let pacientesVistos = $state<Map<string, Paciente>>(new Map());
  let isLoading = $state(true);
  let query = $state("");
  let filtroEstado = $state<"todos" | "ACTIVO" | "INACTIVO">("todos");
  let isSearching = $state(false);

  function tieneComodines(texto: string): boolean {
    return texto.includes('*') || texto.includes('?');
  }

  let isModalOpen = $state(false);
  let isSidebarOpen = $state(false);
  let seleccionados = $state<Set<string>>(new Set());

  let isPdfModalOpen = $state(false);
  let pdfBlob = $state<Blob | null>(null);

  // Historial State
  let isHistorialOpen = $state(false);
  let historialPaciente = $state<{ id: string; nombre: string } | null>(null);

  // DB Status modal
  let isDbStatusOpen = $state(false);

  // Onboarding tour (show max 3 times)
  const ONBOARDING_KEY = "historiasado_onboarding_count";
  let showOnboarding = $state(false);

  function getOnboardingCount(): number {
    try {
      return parseInt(localStorage.getItem(ONBOARDING_KEY) ?? "0", 10) || 0;
    } catch {
      return 0;
    }
  }

  function completeOnboarding() {
    try {
      const count = getOnboardingCount();
      localStorage.setItem(ONBOARDING_KEY, String(count + 1));
    } catch { /* noop */ }
    showOnboarding = false;
    query = "";
  }

  function handleTourSearch(q: string) {
    query = q;
  }

  let camposSeleccionados = $state<string[]>([
    "historia",
    "identificacion",
    "telefono_movil",
    "tipo",
  ]);

  const seleccionadosCount = $derived(seleccionados.size);
  const pacientesSeleccionados = $derived(
    [...seleccionados].map((ind) => pacientesVistos.get(ind)).filter((p): p is Paciente => !!p),
  );

  let cleanupStore: (() => void) | undefined;
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    cleanupStore = pacienteStore.inicializar();
    const checkLoading = setInterval(() => {
      if (!pacienteStore.isLoading) {
        isLoading = false;
        clearInterval(checkLoading);
        if (getOnboardingCount() < 3) {
          showOnboarding = true;
        }
      }
    }, 100);
  });

  onDestroy(() => {
    if (cleanupStore) cleanupStore();
    if (searchTimeout) clearTimeout(searchTimeout);
  });

  $effect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (query.length === 0) {
      resultados = [];
      isSearching = false;
    } else if (query.length >= 1) {
      isSearching = true;
      searchTimeout = setTimeout(async () => {
        try {
          const res = await pacienteStore.buscar(query);
          resultados = res;
          const next = new Map(pacientesVistos);
          for (const p of res) next.set(p.ind, p);
          pacientesVistos = next;
        } catch (error) {
          console.error('Search error:', error);
          resultados = [];
        } finally {
          isSearching = false;
        }
      }, 300);
    } else {
      resultados = [];
    }
  });

  function handleQueryChange(q: string) {
    query = q;
  }
  function handleFiltroChange(f: "todos" | "ACTIVO" | "INACTIVO") {
    // Filtro no longer needed with remote search
  }
  function handleSaveCampos(campos: string[]) {
    camposSeleccionados = campos;
  }

  function handleToggleSeleccion(id: string) {
    const next = new Set(seleccionados);
    next.has(id) ? next.delete(id) : next.add(id);
    seleccionados = next;
  }

  function handleRemoveSeleccion(id: string) {
    const next = new Set(seleccionados);
    next.delete(id);
    seleccionados = next;
  }

  function handleClearSelection() {
    seleccionados = new Set();
  }

  function handleSelectAll() {
    const next = new Set<string>(seleccionados);
    for (const p of resultados) next.add(p.ind);
    seleccionados = next;
  }

  function handleGenerarPDF(blob: Blob) {
    pdfBlob = blob;
    isPdfModalOpen = true;
  }

  function handleClosePdfModal() {
    isPdfModalOpen = false;
    pdfBlob = null;
  }

  function handleOpenHistorial(id: string, nombre: string) {
    historialPaciente = { id, nombre };
    isHistorialOpen = true;
  }
</script>

{#if isLoading}
  <LoadingScreen message="Cargando pacientes..." />
{:else}
  <OfflineStatus />

  <div class="flex min-h-dvh flex-col bg-slate-50">
    <!-- ===== Header ===== -->
    <header
      class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm"
    >
      <div
        class="mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:max-w-none"
      >
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-600/30"
          >
            <img src={logoUrl} alt="HistoriasAdo" class="h-6 w-6 object-contain drop-shadow-sm" />
          </div>
          <div class="hidden sm:block">
            <h1 class="text-base font-bold leading-none text-slate-900">
              HistoriasAdo
            </h1>
            <p class="mt-0.5 text-xs text-slate-500 leading-none">
              Gestión de Pacientes
            </p>
          </div>
        </div>

        <!-- Center: stats chip (desktop) -->
        <div class="hidden items-center gap-2 md:flex">
          <div
            class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
              ></span>
              <span
                class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
              ></span>
            </span>
            <span class="text-xs font-semibold text-slate-600">
              {resultados.length.toLocaleString("es-CO")} resultados
            </span>
          </div>
        </div>

        <!-- Right: selection chip + help -->
        <div class="flex items-center gap-2">
          {#if seleccionadosCount > 0}
            <button
              onclick={() => (isSidebarOpen = true)}
              class="hidden sm:flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
            >
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
              >
                {seleccionadosCount}
              </span>
              seleccionado{seleccionadosCount !== 1 ? "s" : ""}
            </button>
          {/if}
          <button
            onclick={() => (isDbStatusOpen = true)}
            class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-md active:scale-95"
            aria-label="Estado de la base de datos"
            title="Estado offline / IndexedDB"
          >
            <Database class="h-4 w-4" />
          </button>
          <button
            onclick={() => (showOnboarding = true)}
            class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-md active:scale-95"
            aria-label="Ayuda - Ver tutorial"
            title="Ver tutorial"
          >
            <HelpCircle class="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- ===== Body: Sidebar + Main ===== -->
    <div class="flex flex-1">
      <!-- Left sidebar -->
      <SelectedPatientsSidebar
        pacientes={pacientesSeleccionados}
        onRemove={handleRemoveSeleccion}
        onClear={handleClearSelection}
        isOpen={isSidebarOpen}
        onClose={() => (isSidebarOpen = false)}
        onGenerarPDF={handleGenerarPDF}
      />

      <!-- Main content -->
      <main class="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-8">
        <!-- Search area -->
        <div class="mb-6">
          <SearchBar
            bind:query
            bind:filtroEstado
            totalResultados={resultados.length}
            {seleccionadosCount}
            isOnline={pacienteStore.isOnline}
            isSearchingOnline={pacienteStore.isSearchingOnline}
            isSyncing={pacienteStore.isSyncing}
            onQueryChange={handleQueryChange}
            onFiltroChange={handleFiltroChange}
            onOpenFieldSelector={() => (isModalOpen = true)}
            onOpenSidebar={() => (isSidebarOpen = true)}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          />
        </div>

        <!-- Results area -->
        {#if query.length === 0}
          <!-- Empty / welcome state -->
          <div
            data-tour="area-resultados"
            class="animate-fade-in flex flex-col items-center justify-center py-24 text-center"
          >
            <div class="relative mb-6">
              <div
                class="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-inner"
              >
                <Search class="h-11 w-11 text-blue-500" />
              </div>
              <div
                class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"
              >
                <Sparkles class="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">Busca un paciente</h2>
            <p class="mt-2 max-w-xs text-sm text-slate-500 leading-relaxed">
              Escribe al menos <span class="font-semibold text-blue-600"
                >3 caracteres</span
              > o usa comodines (<span class="font-mono font-semibold text-blue-600">*</span> y <span class="font-mono font-semibold text-blue-600">?</span>) para buscar.
            </p>
            <div class="mt-8 flex gap-3">
              <div
                class="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm"
              >
                <span class="text-xl font-bold text-slate-800"
                  >{pacienteStore.dbStats.total.toLocaleString("es-CO")}</span
                >
                <span class="text-xs text-slate-500">Pacientes en DB local</span>
              </div>
              <div
                class="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm"
              >
                <span class="text-xl font-bold text-emerald-600">
                  {pacienteStore.dbStats.synced.toLocaleString("es-CO")}
                </span>
                <span class="text-xs text-slate-500">Sincronizados</span>
              </div>
            </div>
          </div>
        {:else if query.length < 3 && !tieneComodines(query)}
          <!-- Min chars hint -->
          <div
            class="animate-fade-in flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              class="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50"
            >
              <AlertCircle class="h-10 w-10 text-amber-500" />
            </div>
            <h2 class="text-xl font-bold text-slate-800">Sigue escribiendo</h2>
            <p class="mt-2 text-sm text-slate-500">
              Necesitas <span class="font-semibold text-amber-600"
                >{3 - query.length} carácter{3 - query.length !== 1 ? "es" : ""}
                más</span
              > para comenzar
            </p>
            <!-- Mini progress bar -->
            <div
              class="mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200"
            >
              <div
                class="h-full rounded-full bg-amber-400 transition-all duration-300"
                style="width: {(query.length / 3) * 100}%"
              ></div>
            </div>
          </div>
        {:else if isSearching}
          <!-- Loading profesional -->
          <div class="animate-fade-in flex flex-col items-center justify-center py-16">
            <div class="mb-6 flex flex-col items-center gap-3">
              <div class="relative">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p class="text-sm font-medium text-slate-600">Buscando pacientes...</p>
            </div>
            <!-- Skeleton resultados -->
            <div class="w-full max-w-5xl space-y-3 px-4">
              {#each Array(5) as _, i}
                <div class="animate-pulse flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                  <div class="h-10 w-10 rounded-lg bg-slate-200"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 w-1/3 rounded bg-slate-200"></div>
                    <div class="h-3 w-1/4 rounded bg-slate-200"></div>
                  </div>
                  <div class="h-8 w-20 rounded bg-slate-200"></div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <PatientList
            pacientes={resultados}
            camposVisibles={camposSeleccionados}
            {isLoading}
            {isSearching}
            {seleccionados}
            onToggleSeleccion={handleToggleSeleccion}
            onOpenHistorial={handleOpenHistorial}
          />
        {/if}
      </main>
    </div>
  </div>

  <!-- Modals -->
  <FieldSelectorModal
    bind:isOpen={isModalOpen}
    onClose={() => (isModalOpen = false)}
    onSave={handleSaveCampos}
    {camposSeleccionados}
  />

  {#if isPdfModalOpen && pdfBlob}
    <PdfPreviewModal
      {pdfBlob}
      pacienteCount={pacientesSeleccionados.length}
      bind:isOpen={isPdfModalOpen}
      onClose={handleClosePdfModal}
    />
  {/if}

  {#if isHistorialOpen && historialPaciente}
    <HistorialModal
      historia={historialPaciente.id}
      nombrePaciente={historialPaciente.nombre}
      bind:isOpen={isHistorialOpen}
      onClose={() => {}}
    />
  {/if}

  <DbStatusModal bind:isOpen={isDbStatusOpen} onClose={() => (isDbStatusOpen = false)} />

  {#if showOnboarding}
    <OnboardingTour onComplete={completeOnboarding} onSearch={handleTourSearch} />
  {/if}
{/if}
