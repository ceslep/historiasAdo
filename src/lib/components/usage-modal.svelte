<script lang="ts">
  import {
    X, Activity, Search, FileText, History, RotateCcw,
    AppWindow, Monitor, Smartphone, Tablet, Globe,
    ChevronDown, ChevronUp, MapPin
  } from "lucide-svelte";
  import { usageStore } from "../stores/usageStore.svelte";
  import type { ClientSession } from "../stores/usageStore.svelte";
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
  let showSessions = $state(false);
  let expandedSession = $state<number | null>(null);

  function formatTime(timestamp: number | null): string {
    if (!timestamp) return "Nunca";
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  }

  function formatTimeShort(timestamp: number | null): string {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  }

  function toggleSessions() {
    showSessions = !showSessions;
    if (showSessions && usageStore.sessions.length === 0) {
      usageStore.loadSessions();
    }
  }

  function toggleExpanded(index: number) {
    expandedSession = expandedSession === index ? null : index;
  }

  function getDeviceIcon(device: string) {
    if (device === 'Móvil') return Smartphone;
    if (device === 'Tablet') return Tablet;
    return Monitor;
  }

  // Reverse sessions so newest first
  const reversedSessions = $derived(
    [...usageStore.sessions].reverse()
  );
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
      <div class="max-h-[70vh] overflow-y-auto p-5">
        <div class="grid gap-3">
          <!-- Aperturas de App -->
          <div
            class="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600"
              >
                <AppWindow class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-700">Aperturas de App</p>
                <p class="text-xs text-slate-500">Veces que se abrió la aplicación</p>
              </div>
            </div>
            <div class="text-xl font-bold text-slate-800">
              {usageStore.stats.appOpenCount.toLocaleString("es-CO")}
            </div>
          </div>

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

        <!-- Sessions toggle -->
        <button
          onclick={toggleSessions}
          class="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <div class="flex items-center gap-2">
            <Globe class="h-4 w-4 text-slate-500" />
            <span>Sesiones recientes ({usageStore.stats.appOpenCount})</span>
          </div>
          {#if showSessions}
            <ChevronUp class="h-4 w-4 text-slate-400" />
          {:else}
            <ChevronDown class="h-4 w-4 text-slate-400" />
          {/if}
        </button>

        <!-- Sessions list -->
        {#if showSessions}
          <div class="mt-3 space-y-2">
            {#if reversedSessions.length === 0}
              <p class="py-4 text-center text-xs text-slate-400">Cargando sesiones...</p>
            {:else}
              {#each reversedSessions as session, i}
                {@const DeviceIcon = getDeviceIcon(session.device)}
                <div class="rounded-lg border border-slate-100 bg-white shadow-sm">
                  <!-- Session header -->
                  <button
                    onclick={() => toggleExpanded(i)}
                    class="flex w-full items-center justify-between px-3 py-2.5 text-left"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <DeviceIcon class="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p class="text-xs font-medium text-slate-700">
                          {session.browser}{session.browserVersion ? ` ${session.browserVersion.split('.')[0]}` : ''} · {session.os}
                        </p>
                        <div class="flex items-center gap-1.5">
                          {#if session.city}
                            <span class="text-[10px] text-emerald-600">
                              📍 {session.city}, {session.region}
                            </span>
                            <span class="text-[10px] text-slate-300">·</span>
                          {/if}
                          <span class="text-[10px] text-slate-400">
                            {formatTimeShort(session.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {session.device}
                      </span>
                      {#if expandedSession === i}
                        <ChevronUp class="h-3.5 w-3.5 text-slate-400" />
                      {:else}
                        <ChevronDown class="h-3.5 w-3.5 text-slate-400" />
                      {/if}
                    </div>
                  </button>

                  <!-- Expanded details -->
                  {#if expandedSession === i}
                    <div class="border-t border-slate-50 px-3 py-2.5 space-y-2.5">

                      <!-- Location section -->
                      {#if session.city || session.geoLat}
                        <div class="rounded-lg bg-emerald-50/60 p-2.5">
                          <div class="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <MapPin class="h-3 w-3" />
                            Ubicación
                          </div>
                          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                            {#if session.city}
                              <div>
                                <span class="text-emerald-500">Ciudad:</span>
                                <span class="ml-1 text-slate-700">{session.city}</span>
                              </div>
                              <div>
                                <span class="text-emerald-500">Región:</span>
                                <span class="ml-1 text-slate-700">{session.region}</span>
                              </div>
                              <div>
                                <span class="text-emerald-500">País:</span>
                                <span class="ml-1 text-slate-700">{session.country} {session.countryCode ? `(${session.countryCode})` : ''}</span>
                              </div>
                              {#if session.zipCode}
                                <div>
                                  <span class="text-emerald-500">Código postal:</span>
                                  <span class="ml-1 text-slate-700">{session.zipCode}</span>
                                </div>
                              {/if}
                              <div>
                                <span class="text-emerald-500">Coord. IP:</span>
                                <span class="ml-1 font-mono text-slate-600">{session.ipLat?.toFixed(4)}, {session.ipLon?.toFixed(4)}</span>
                              </div>
                            {/if}
                            {#if session.geoLat}
                              <div class="col-span-2">
                                <span class="text-emerald-500">GPS navegador:</span>
                                <span class="ml-1 font-mono text-slate-600">
                                  {session.geoLat.toFixed(5)}, {session.geoLon?.toFixed(5)}
                                  {#if session.geoAccuracy}
                                    <span class="text-slate-400">(±{Math.round(session.geoAccuracy)}m)</span>
                                  {/if}
                                </span>
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/if}

                      <!-- Network / ISP section -->
                      {#if session.isp || session.ip}
                        <div class="rounded-lg bg-blue-50/60 p-2.5">
                          <div class="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                            <Globe class="h-3 w-3" />
                            Red
                          </div>
                          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                            <div>
                              <span class="text-blue-400">IP:</span>
                              <span class="ml-1 font-mono text-slate-600">{session.ip}</span>
                            </div>
                            {#if session.isp}
                              <div>
                                <span class="text-blue-400">ISP:</span>
                                <span class="ml-1 text-slate-600">{session.isp}</span>
                              </div>
                            {/if}
                            {#if session.org}
                              <div class="col-span-2">
                                <span class="text-blue-400">Org:</span>
                                <span class="ml-1 text-slate-600">{session.org}</span>
                              </div>
                            {/if}
                            {#if session.as}
                              <div class="col-span-2">
                                <span class="text-blue-400">AS:</span>
                                <span class="ml-1 font-mono text-slate-600">{session.as}</span>
                              </div>
                            {/if}
                            <div>
                              <span class="text-blue-400">Conexión:</span>
                              <span class="ml-1 text-slate-600">{session.connection || '—'}</span>
                            </div>
                            <div>
                              <span class="text-blue-400">Online:</span>
                              <span class="ml-1 text-slate-600">{session.online ? 'Sí' : 'No'}</span>
                            </div>
                            {#if session.mobile != null}
                              <div>
                                <span class="text-blue-400">Red móvil:</span>
                                <span class="ml-1 text-slate-600">{session.mobile ? 'Sí' : 'No'}</span>
                              </div>
                            {/if}
                            {#if session.proxy != null}
                              <div>
                                <span class="text-blue-400">Proxy/VPN:</span>
                                <span class="ml-1 text-slate-600">{session.proxy ? 'Sí' : 'No'}</span>
                              </div>
                            {/if}
                            {#if session.hosting != null}
                              <div>
                                <span class="text-blue-400">Hosting:</span>
                                <span class="ml-1 text-slate-600">{session.hosting ? 'Sí' : 'No'}</span>
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/if}

                      <!-- Device details section -->
                      <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        <div>
                          <span class="text-slate-400">Plataforma:</span>
                          <span class="ml-1 text-slate-600">{session.platform || '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">Pantalla:</span>
                          <span class="ml-1 text-slate-600">
                            {session.screenWidth}×{session.screenHeight}
                          </span>
                        </div>
                        <div>
                          <span class="text-slate-400">Viewport:</span>
                          <span class="ml-1 text-slate-600">
                            {session.viewportWidth}×{session.viewportHeight}
                          </span>
                        </div>
                        <div>
                          <span class="text-slate-400">DPR:</span>
                          <span class="ml-1 text-slate-600">{session.devicePixelRatio || '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">Color:</span>
                          <span class="ml-1 text-slate-600">{session.colorDepth ? `${session.colorDepth}bit` : '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">Zona horaria:</span>
                          <span class="ml-1 text-slate-600">{session.timezone || '—'}</span>
                        </div>
                        {#if session.ipTimezone && session.ipTimezone !== session.timezone}
                          <div>
                            <span class="text-slate-400">TZ (IP):</span>
                            <span class="ml-1 text-slate-600">{session.ipTimezone}</span>
                          </div>
                        {/if}
                        <div>
                          <span class="text-slate-400">Idioma:</span>
                          <span class="ml-1 text-slate-600">{session.language || '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">CPU cores:</span>
                          <span class="ml-1 text-slate-600">{session.hardwareConcurrency || '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">RAM:</span>
                          <span class="ml-1 text-slate-600">{session.deviceMemory ? `${session.deviceMemory}GB` : '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">Touch:</span>
                          <span class="ml-1 text-slate-600">{session.maxTouchPoints != null ? `${session.maxTouchPoints} pts` : '—'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">PWA:</span>
                          <span class="ml-1 text-slate-600">{session.standalone ? 'Sí' : 'No'}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">Cookies:</span>
                          <span class="ml-1 text-slate-600">{session.cookiesEnabled ? 'Sí' : 'No'}</span>
                        </div>
                        {#if session.referer}
                          <div class="col-span-2">
                            <span class="text-slate-400">Referrer:</span>
                            <span class="ml-1 break-all text-slate-600">{session.referer}</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        {/if}

        <div class="mt-5 flex items-center justify-between">
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
