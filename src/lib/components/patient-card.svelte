<script lang="ts">
  import type { Paciente } from "../types/paciente";
  import { getIniciales } from "../services/pacienteService";
  import Badge from "./badge.svelte";
  import { History, Phone, Mail, MapPin, Building2, Calendar, DollarSign, FileText, User, Hash, CreditCard, Clock } from "lucide-svelte";

  interface Props {
    paciente: Paciente;
    camposVisibles: string[];
    seleccionado?: boolean;
    onToggleSeleccion?: (id: string) => void;
    onOpenHistorial?: (id: string, nombre: string) => void;
    onclick?: () => void;
  }

  let {
    paciente,
    camposVisibles,
    seleccionado = false,
    onToggleSeleccion,
    onOpenHistorial,
    onclick,
  }: Props = $props();

  function getValue(campo: string): string {
    const value = paciente[campo as keyof Paciente];
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  }

  function getLabel(campo: string): string {
    const labels: Record<string, string> = {
      ind: "ID",
      historia: "Historia",
      identificacion: "Identificación",
      tdei: "Tipo ID",
      nombres: "Nombres",
      nombre1: "Nombre",
      apellido1: "Apellido",
      fecnac: "F. Nac.",
      edad: "Edad",
      sexo: "Sexo",
      telefono_movil: "Celular",
      telefono_residencia1: "Teléfono",
      email1: "Email",
      direccion_residencia: "Dirección",
      ciudad_residencia: "Ciudad",
      estado: "Estado",
      tipo: "Tipo",
      fecha_inicio: "Inicio",
      costo_tratamiento: "Costo",
      retencion: "Retención",
      terminado: "Terminado",
    };
    return labels[campo] || campo;
  }

  const fieldIcons: Record<string, typeof Phone> = {
    telefono_movil: Phone,
    telefono_residencia1: Phone,
    email1: Mail,
    direccion_residencia: MapPin,
    ciudad_residencia: Building2,
    fecnac: Calendar,
    fecha_inicio: Calendar,
    costo_tratamiento: DollarSign,
    tipo: FileText,
    edad: User,
    sexo: User,
    historia: Hash,
    identificacion: CreditCard,
    retencion: Clock,
    terminado: Clock,
  };

  function handleCheckboxClick(e: MouseEvent) {
    e.stopPropagation();
    if (onToggleSeleccion) onToggleSeleccion(paciente.ind);
  }

  function handleCardClick() {
    if (onclick) onclick();
  }

  const initials = $derived(getIniciales(paciente.nombres));
  const isActivo = $derived(paciente.estado === "ACTIVO");
  const historiaValue = $derived(getValue("historia"));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  onclick={handleCardClick}
  role="button"
  tabindex="0"
  class="animate-fade-in group relative w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
>
  <div
    class="relative overflow-hidden rounded-2xl border transition-all duration-300
    hover:-translate-y-1.5
    {seleccionado
      ? 'border-blue-400/70 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 shadow-lg shadow-blue-300/30 ring-1 ring-blue-300/40'
      : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300/80 hover:shadow-lg hover:shadow-slate-200/50'}"
  >
    <!-- Left accent bar -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300
      {seleccionado
        ? 'bg-gradient-to-b from-blue-500 to-indigo-600'
        : isActivo
          ? 'bg-gradient-to-b from-blue-400 to-indigo-500 opacity-60 group-hover:opacity-100'
          : 'bg-gradient-to-b from-slate-300 to-slate-400 opacity-40 group-hover:opacity-70'}"
    ></div>

    <!-- Selection glow overlay -->
    {#if seleccionado}
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 rounded-2xl"
      ></div>
    {/if}

    <!-- Checkbox overlaying avatar -->
    <div class="absolute left-3 top-3 z-10">
      <button
        onclick={handleCheckboxClick}
        class="flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 transition-all duration-200
          {seleccionado
          ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-400/40 scale-110'
          : 'border-slate-300/80 bg-white/90 backdrop-blur-sm hover:border-blue-400 hover:shadow-md hover:scale-110'}"
        aria-label={seleccionado ? "Deseleccionar" : "Seleccionar"}
      >
        {#if seleccionado}
          <svg
            class="h-3 w-3 text-white animate-bounce-in"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        {/if}
      </button>
    </div>

    <!-- Header -->
    <div class="flex items-start gap-3.5 px-4 pt-4 pl-5 overflow-hidden">
      <!-- Avatar with ring and status indicator -->
      <div class="relative shrink-0">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105
          {isActivo
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-200/60 ring-offset-1'
            : 'bg-gradient-to-br from-slate-400 to-slate-500 text-white ring-2 ring-slate-200/60 ring-offset-1'}
          text-sm font-bold shadow-md
          {isActivo ? 'shadow-blue-300/40' : 'shadow-slate-300/40'}"
        >
          {initials}
        </div>
        <!-- Status dot -->
        <div class="absolute -bottom-0.5 -right-0.5">
          <span class="relative flex h-3.5 w-3.5">
            {#if isActivo}
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50"></span>
              <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
            {:else}
              <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white shadow-sm"></span>
            {/if}
          </span>
        </div>
      </div>

      <div class="min-w-0 flex-1 pt-0.5">
        <div class="flex items-center gap-2 mb-1.5">
          <span
            class="shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-blue-500/20"
          >
            #{historiaValue}
          </span>
          <h3
            class="whitespace-normal break-words text-sm font-bold text-slate-900 sm:text-base leading-tight"
          >
            {getValue("nombres")}
          </h3>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          {#if getValue("identificacion") !== "-"}
            <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
              <CreditCard class="h-3 w-3 text-slate-400" />
              {getValue("tdei")}:
              <span class="font-semibold text-slate-700">{getValue("identificacion")}</span>
            </span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Extra fields grid -->
    {#if camposVisibles.length > 0}
      {@const visibleFields = camposVisibles
        .slice(0, 4)
        .filter((c) => getValue(c) !== "-")}
      {#if visibleFields.length > 0}
        <div
          class="mx-4 mt-3.5 grid gap-2 rounded-xl border border-slate-100/80 bg-slate-50/50 p-2.5
          {visibleFields.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}"
        >
          {#each visibleFields as campo}
            {@const IconComponent = fieldIcons[campo]}
            <div class="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-1.5 shadow-sm border border-slate-100/60">
              {#if IconComponent}
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <IconComponent class="h-3 w-3" />
                </div>
              {/if}
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
                  {getLabel(campo)}
                </span>
                <span class="truncate text-xs font-medium text-slate-700 mt-0.5 leading-tight">
                  {getValue(campo)}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- Footer -->
    <div
      class="flex items-center justify-between border-t border-slate-100/80 px-4 py-2.5 mt-3 pl-5"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Estado badge -->
        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold
          {isActivo
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
            : 'bg-slate-100 text-slate-600 border border-slate-200/60'}">
          <span class="h-1.5 w-1.5 rounded-full {isActivo ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
          {isActivo ? 'Activo' : 'Inactivo'}
        </span>

        {#if getValue("tipo") !== "-"}
          <span class="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 truncate">
            <FileText class="h-3 w-3 shrink-0 text-slate-400" />
            <span class="truncate font-medium">{getValue("tipo")}</span>
          </span>
        {/if}
      </div>

      <button
        data-tour="historial-btn"
        onclick={(e) => {
          e.stopPropagation();
          onOpenHistorial?.(historiaValue, getValue("nombres"));
        }}
        class="group/btn flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-300
        bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200/50
        hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-blue-300/30 hover:scale-105
        active:scale-95 ml-2"
        aria-label="Ver historial"
        title="Ver historial"
      >
        <History
          class="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:rotate-12"
        />
        <span class="hidden sm:inline">Historial</span>
      </button>
    </div>
  </div>
</div>
