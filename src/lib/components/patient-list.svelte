<script lang="ts">
  import type { Paciente } from "../types/paciente";
  import PatientCard from "./patient-card.svelte";
  import { SearchX } from "lucide-svelte";

  interface Props {
    pacientes: Paciente[];
    camposVisibles: string[];
    isLoading?: boolean;
    seleccionados?: Set<string>;
    onToggleSeleccion?: (id: string) => void;
    onOpenHistorial?: (id: string, nombre: string) => void;
  }

  let {
    pacientes,
    camposVisibles,
    isLoading = false,
    seleccionados = new Set(),
    onToggleSeleccion,
    onOpenHistorial,
  }: Props = $props();
</script>

{#if isLoading}
  <!-- Skeleton grid -->
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each Array(6) as _, i}
      <div
        class="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm overflow-hidden"
        style="animation: fade-in 0.35s var(--ease-smooth) both; animation-delay: {i * 0.06}s;"
      >
        <!-- Left accent bar skeleton -->
        <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl skeleton"></div>

        <div class="flex items-start gap-3.5 pl-2">
          <div class="skeleton h-12 w-12 shrink-0 rounded-xl"></div>
          <div class="flex-1 space-y-2.5 pt-1">
            <div class="flex items-center gap-2">
              <div class="skeleton h-5 w-14 rounded-lg"></div>
              <div class="skeleton h-4 w-3/5 rounded-lg"></div>
            </div>
            <div class="skeleton h-3 w-2/5 rounded-lg"></div>
          </div>
        </div>
        <!-- Field chips skeleton -->
        <div class="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/50 p-2.5">
          <div class="skeleton h-10 rounded-lg"></div>
          <div class="skeleton h-10 rounded-lg"></div>
        </div>
        <!-- Footer skeleton -->
        <div class="mt-3 flex items-center justify-between pt-3 border-t border-slate-100/80">
          <div class="skeleton h-6 w-16 rounded-full"></div>
          <div class="skeleton h-8 w-20 rounded-xl"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if pacientes.length === 0}
  <div
    class="animate-fade-in flex flex-col items-center justify-center py-20 text-center"
  >
    <!-- Decorative icon -->
    <div class="relative mb-6">
      <!-- Outer ring -->
      <div
        class="absolute inset-0 -m-4 rounded-full border-2 border-dashed border-slate-200/60"
        style="animation: spin-smooth 20s linear infinite;"
      ></div>
      <div
        class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner ring-4 ring-slate-100/50 ring-offset-2"
      >
        <SearchX class="h-9 w-9 text-slate-400" />
      </div>
    </div>
    <h3 class="text-lg font-bold text-slate-800">Sin resultados</h3>
    <p class="mt-2 max-w-xs text-sm text-slate-500 leading-relaxed">
      No encontramos pacientes que coincidan con tu búsqueda. Intenta con otros
      términos.
    </p>
    <div class="mt-5 flex items-center gap-2 rounded-full bg-slate-100/80 border border-slate-200/60 px-4 py-2">
      <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
      <span class="text-xs font-medium text-slate-500">Prueba con nombre, identificación o historia</span>
    </div>
  </div>
{:else}
  <div class="animate-fade-in grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each pacientes as paciente, i (paciente.ind)}
      <div
        data-tour={i === 0 ? "patient-card" : undefined}
        style="animation: fade-in 0.35s var(--ease-smooth) both; animation-delay: {Math.min(i * 0.04, 0.4)}s;"
      >
        <PatientCard
          {paciente}
          {camposVisibles}
          seleccionado={seleccionados.has(paciente.ind)}
          {onToggleSeleccion}
          {onOpenHistorial}
        />
      </div>
    {/each}
  </div>
{/if}
