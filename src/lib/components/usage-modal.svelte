<script lang="ts">
  import { X, Activity, Search, FileText, History, RotateCcw } from "lucide-svelte";
  import { usageStore } from "../stores/usageStore.svelte";
  import { APP_VERSION, APP_BUILD_DATE } from "../version";

  const buildDate = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(APP_BUILD_DATE));

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen = $bindable(false), onClose }: Props = $props();

  function formatTime(timestamp: number | null): string {
    if (!timestamp) return "Nunca";
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 pt-16 backdrop-blur-sm sm:p-6"
    onclick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div
      class="animate-in fade-in zoom-in-95 relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 xl:max-w-md"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4"
      >
        <div class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
          >
            <Activity class="h-4 w-4" />
          </div>
          <h2 class="text-base font-semibold text-slate-800">Uso de la Aplicación</h2>
        </div>
        <button
          onclick={onClose}
          class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Cerrar modal"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-5">
        <div class="grid gap-4">
          <!-- Búsquedas -->
          <div
            class="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"
              >
                <Search class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-700">Búsquedas Realizadas</p>
                <p class="text-xs text-slate-500">Consultas de pacientes</p>
              </div>
            </div>
            <div class="text-xl font-bold text-slate-800">
              {usageStore.stats.searchCount.toLocaleString("es-CO")}
            </div>
          </div>

          <!-- PDFs -->
          <div
            class="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600"
              >
                <FileText class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-700">PDFs Generados</p>
                <p class="text-xs text-slate-500">Documentos exportados</p>
              </div>
            </div>
            <div class="text-xl font-bold text-slate-800">
              {usageStore.stats.pdfExportCount.toLocaleString("es-CO")}
            </div>
          </div>

          <!-- Historial -->
          <div
            class="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600"
              >
                <History class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-700">Historiales Vistos</p>
                <p class="text-xs text-slate-500">Detalles consultados</p>
              </div>
            </div>
            <div class="text-xl font-bold text-slate-800">
              {usageStore.stats.historyViewCount.toLocaleString("es-CO")}
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <p class="text-xs text-slate-500">
            Última actividad: {formatTime(usageStore.stats.lastActive)}
          </p>
          <button
            onclick={() => usageStore.resetStats()}
            class="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw class="h-3.5 w-3.5" />
            Reiniciar
          </button>
        </div>

        <!-- Versión -->
        <div class="mt-4 border-t border-slate-100 pt-3">
          <p class="text-[11px] text-slate-400">
            v{APP_VERSION} · Build: {buildDate}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
