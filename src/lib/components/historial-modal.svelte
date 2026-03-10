<script lang="ts">
  import { X, Calendar, CreditCard, DollarSign, FileText, Loader2, AlertCircle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-svelte';
  import type { Cita, Abono, Saldo, Pago } from '../types/historial';
  import { fetchHistorial } from '../services/historialService';

  interface Props {
    historia: string;
    nombrePaciente: string;
    isOpen: boolean;
    onClose: () => void;
  }

  let { historia, nombrePaciente, isOpen = $bindable(), onClose }: Props = $props();

  let activeTab = $state<'citas' | 'abonos' | 'saldos' | 'pagos'>('citas');
  let loading = $state(true);
  let error = $state<string | null>(null);
  let historialData = $state<{ citas: Cita[]; abonos: Abono[]; saldos: Saldo[]; pagos: Pago[] } | null>(null);

  const tabs = [
    { id: 'citas', label: 'Citas', icon: Calendar, color: 'from-blue-500 to-indigo-500', activeBg: 'bg-blue-50', activeText: 'text-blue-700', countBg: 'bg-blue-100 text-blue-700' },
    { id: 'abonos', label: 'Abonos', icon: CreditCard, color: 'from-emerald-500 to-green-500', activeBg: 'bg-emerald-50', activeText: 'text-emerald-700', countBg: 'bg-emerald-100 text-emerald-700' },
    { id: 'saldos', label: 'Saldos', icon: DollarSign, color: 'from-amber-500 to-orange-500', activeBg: 'bg-amber-50', activeText: 'text-amber-700', countBg: 'bg-amber-100 text-amber-700' },
    { id: 'pagos', label: 'Pagos', icon: FileText, color: 'from-violet-500 to-purple-500', activeBg: 'bg-violet-50', activeText: 'text-violet-700', countBg: 'bg-violet-100 text-violet-700' },
  ] as const;

  const sortedCitas = $derived(
    [...(historialData?.citas || [])].sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  );
  const sortedAbonos = $derived(
    [...(historialData?.abonos || [])].sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  );
  const sortedSaldos = $derived(
    [...(historialData?.saldos || [])].sort((a, b) =>
      parseInt(b.no) - parseInt(a.no)
    )
  );
  const sortedPagos = $derived(
    [...(historialData?.pagos || [])].sort((a, b) => {
      const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return dateB - dateA;
    })
  );

  function getTabCount(tabId: string): number {
    if (!historialData) return 0;
    if (tabId === 'citas') return sortedCitas.length;
    if (tabId === 'abonos') return sortedAbonos.length;
    if (tabId === 'saldos') return sortedSaldos.length;
    return sortedPagos.length;
  }

  $effect(() => {
    if (isOpen && historia) {
      loading = true;
      error = null;
      historialData = null;
      loadHistorial();
    }
  });

  async function loadHistorial() {
    try {
      const response = await fetchHistorial(historia);
      if (response.results && response.results.length > 0) {
        historialData = response.results[0].data;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error al cargar el historial';
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    isOpen = false;
    onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CO');
    } catch {
      return dateStr;
    }
  }

  function formatCurrency(value: number | string | null): string {
    if (!value && value !== 0) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(num);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if isOpen}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="animate-slide-up relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] border border-slate-200/80"
    >
      <!-- Top accent gradient -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-t-2xl"></div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-400/30">
            <Clock class="h-5 w-5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900">Historial del Paciente</h2>
              <span class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                #{historia}
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-0.5">{nombrePaciente}</p>
          </div>
        </div>
        <button
          onclick={handleClose}
          class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
          aria-label="Cerrar"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-slate-200/80 px-4 py-2 bg-slate-50/50">
        {#each tabs as tab}
          {@const isActive = activeTab === tab.id}
          <button
            onclick={() => activeTab = tab.id}
            class="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200
              {isActive
                ? tab.activeBg + ' ' + tab.activeText + ' shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}"
          >
            <tab.icon class="h-4 w-4" />
            <span class="hidden sm:inline">{tab.label}</span>
            {#if historialData}
              <span class="rounded-full px-1.5 py-0.5 text-[10px] font-bold
                {isActive ? tab.countBg : 'bg-slate-200/80 text-slate-500'}">
                {getTabCount(tab.id)}
              </span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Content -->
      <div class="overflow-auto p-5" style="max-height: calc(90vh - 200px);">
        {#if loading}
          <!-- Skeleton loading -->
          <div class="space-y-3">
            {#each Array(4) as _, i}
              <div class="rounded-xl border border-slate-200/80 bg-white p-4" style="animation: fade-in 0.35s var(--ease-smooth) both; animation-delay: {i * 0.08}s;">
                <div class="flex items-center gap-3">
                  <div class="skeleton h-10 w-10 rounded-lg"></div>
                  <div class="flex-1 space-y-2">
                    <div class="skeleton h-4 w-3/4 rounded-lg"></div>
                    <div class="skeleton h-3 w-1/2 rounded-lg"></div>
                  </div>
                  <div class="skeleton h-6 w-16 rounded-full"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if error}
          <!-- Error state -->
          <div class="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div class="relative mb-5">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 shadow-inner ring-4 ring-red-100/50">
                <AlertCircle class="h-8 w-8 text-red-500" />
              </div>
            </div>
            <p class="text-lg font-bold text-slate-900">Error al cargar</p>
            <p class="mt-1.5 text-sm text-slate-500 max-w-xs">{error}</p>
            <button
              onclick={loadHistorial}
              class="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <RefreshCw class="h-4 w-4" />
              Reintentar
            </button>
          </div>
        {:else if historialData}
          <!-- Citas Tab -->
          {#if activeTab === 'citas'}
            <div class="overflow-x-auto rounded-xl border border-slate-200/80">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gradient-to-r from-slate-800 to-slate-700 text-left text-xs font-semibold uppercase text-slate-200 tracking-wider">
                    <th class="px-4 py-3 rounded-tl-xl">Fecha</th>
                    <th class="px-4 py-3">Hora</th>
                    <th class="px-4 py-3">Consultorio</th>
                    <th class="px-4 py-3">Asistió</th>
                    <th class="px-4 py-3">Tipo</th>
                    <th class="px-4 py-3 rounded-tr-xl">Duración</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100/80">
                  {#each sortedCitas as cita, i}
                    <tr class="hover:bg-blue-50/30 transition-colors {i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}">
                      <td class="px-4 py-3 font-medium text-slate-700">{formatDate(cita.fecha)}</td>
                      <td class="px-4 py-3 text-slate-600">{cita.horas}</td>
                      <td class="px-4 py-3 text-slate-600">{cita.consultorio}</td>
                      <td class="px-4 py-3">
                        {#if cita.asistio === 'S'}
                          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle class="h-3 w-3" />
                            Sí
                          </span>
                        {:else}
                          <span class="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200/60 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            <XCircle class="h-3 w-3" />
                            No
                          </span>
                        {/if}
                      </td>
                      <td class="px-4 py-3 text-slate-600">{cita.tipo || '-'}</td>
                      <td class="px-4 py-3">
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{cita.duracion} min</span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          <!-- Abonos Tab -->
          {#if activeTab === 'abonos'}
            <div class="overflow-x-auto rounded-xl border border-slate-200/80">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gradient-to-r from-slate-800 to-slate-700 text-left text-xs font-semibold uppercase text-slate-200 tracking-wider">
                    <th class="px-4 py-3 rounded-tl-xl">Fecha</th>
                    <th class="px-4 py-3">Recibo</th>
                    <th class="px-4 py-3">Valor</th>
                    <th class="px-4 py-3">Forma de Pago</th>
                    <th class="px-4 py-3 rounded-tr-xl">Detalle</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100/80">
                  {#each sortedAbonos as abono, i}
                    <tr class="hover:bg-emerald-50/30 transition-colors {i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}">
                      <td class="px-4 py-3 font-medium text-slate-700">{formatDate(abono.fecha)}</td>
                      <td class="px-4 py-3 text-slate-600">{abono.recibo}</td>
                      <td class="px-4 py-3">
                        <span class="font-bold text-emerald-700">{formatCurrency(abono.valor_abono)}</span>
                      </td>
                      <td class="px-4 py-3">
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {abono.forma_de_pago || '-'}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-slate-600">{abono.detalle || '-'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          <!-- Saldos Tab -->
          {#if activeTab === 'saldos'}
            <div class="space-y-4">
              {#each sortedSaldos as saldo, i}
                <div
                  class="relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm overflow-hidden"
                  style="animation: fade-in 0.35s var(--ease-smooth) both; animation-delay: {i * 0.06}s;"
                >
                  <!-- Left accent -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-orange-500"></div>

                  <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 pl-2">
                    <div class="rounded-lg bg-slate-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                      <p class="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(saldo.a)}</p>
                    </div>
                    <div class="rounded-lg bg-emerald-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Abonado</p>
                      <p class="text-lg font-bold text-emerald-600 mt-0.5">{formatCurrency(saldo.b)}</p>
                    </div>
                    <div class="rounded-lg {parseFloat(saldo.saldo) > 0 ? 'bg-red-50' : 'bg-emerald-50'} p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider {parseFloat(saldo.saldo) > 0 ? 'text-red-400' : 'text-emerald-500'}">Saldo</p>
                      <p class="text-lg font-bold {parseFloat(saldo.saldo) > 0 ? 'text-red-600' : 'text-emerald-600'} mt-0.5">
                        {formatCurrency(saldo.saldo)}
                      </p>
                    </div>
                    <div class="rounded-lg bg-blue-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-blue-400">Cuotas</p>
                      <p class="text-lg font-bold text-blue-700 mt-0.5">{saldo.cp} / {saldo.ctn}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Pagos Tab -->
          {#if activeTab === 'pagos'}
            <div class="space-y-4">
              {#each sortedPagos as pago, i}
                <div
                  class="relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm overflow-hidden"
                  style="animation: fade-in 0.35s var(--ease-smooth) both; animation-delay: {i * 0.06}s;"
                >
                  <!-- Left accent -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-violet-400 to-purple-500"></div>

                  <div class="mb-3 flex items-center justify-between pl-2">
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60 px-3 py-1 text-xs font-bold text-violet-700">
                      <FileText class="h-3 w-3" />
                      {pago.tipo || 'Tratamiento'}
                    </span>
                    <span class="text-xs font-medium text-slate-400">
                      {pago.plan || '-'}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 pl-2">
                    <div class="rounded-lg bg-slate-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Costo Total</p>
                      <p class="font-bold text-slate-900 mt-0.5">{formatCurrency(pago.costo_tratamiento)}</p>
                    </div>
                    <div class="rounded-lg bg-emerald-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Cuota Inicial</p>
                      <p class="font-bold text-emerald-600 mt-0.5">{formatCurrency(pago.cuota_inicial1)}</p>
                    </div>
                    <div class="rounded-lg bg-blue-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-blue-400">No. Cuotas</p>
                      <p class="font-bold text-blue-700 mt-0.5">{pago.nocuotas}</p>
                    </div>
                    <div class="rounded-lg bg-indigo-50 p-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Valor Cuota</p>
                      <p class="font-bold text-indigo-700 mt-0.5">{formatCurrency(pago.valor_cuota)}</p>
                    </div>
                  </div>
                  {#if pago.ncuotas > 0}
                    <div class="mt-4 pl-2">
                      <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado de Cuotas</p>
                      <div class="flex flex-wrap gap-1.5">
                        {#each Array(parseInt(pago.nocuotas)) as _, idx}
                          {@const cuotaKey = `cuota${idx + 1}` as keyof typeof pago}
                          {@const isPaid = pago[cuotaKey] === 'S'}
                          <span
                            class="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all
                              {isPaid
                              ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm shadow-emerald-300/40'
                              : 'bg-slate-100 text-slate-400 border border-slate-200/60'}"
                            title="Cuota {idx + 1}: {isPaid ? 'Pagada' : 'Pendiente'}"
                          >
                            {idx + 1}
                          </span>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 shadow-inner mb-4">
              <FileText class="h-8 w-8 text-slate-400" />
            </div>
            <p class="text-lg font-bold text-slate-700">No hay datos disponibles</p>
            <p class="mt-1 text-sm text-slate-500">No se encontró historial para este paciente</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
