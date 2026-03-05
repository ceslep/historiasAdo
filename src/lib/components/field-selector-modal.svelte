<script lang="ts">
  import type { Campo, CampoSeleccionable } from "../types/paciente";
  import { CAMPOS_POR_DEFECTO } from "../types/paciente";
  import { X, Search, Check, SlidersHorizontal } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campos: string[]) => void;
    camposSeleccionados: string[];
  }

  let {
    isOpen = $bindable(),
    onClose,
    onSave,
    camposSeleccionados,
  }: Props = $props();

  let campos: CampoSeleccionable[] = $state(
    CAMPOS_POR_DEFECTO.map((c) => ({
      ...c,
      seleccionado: camposSeleccionados.includes(c.key),
    })),
  );

  let busqueda = $state("");
  let expandedCategories = $state<Set<string>>(
    new Set(["identificacion", "personal", "contacto", "tratamiento"]),
  );

  const categorias = [
    { id: "identificacion", label: "Identificación", icon: "🪪", color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", border: "border-blue-200/60" },
    { id: "personal", label: "Datos Personales", icon: "👤", color: "from-violet-500 to-purple-500", bg: "bg-violet-50", border: "border-violet-200/60" },
    { id: "contacto", label: "Contacto", icon: "📞", color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", border: "border-emerald-200/60" },
    { id: "tratamiento", label: "Tratamiento", icon: "🦷", color: "from-amber-500 to-orange-500", bg: "bg-amber-50", border: "border-amber-200/60" },
  ];

  function toggleCategory(catId: string) {
    const next = new Set(expandedCategories);
    next.has(catId) ? next.delete(catId) : next.add(catId);
    expandedCategories = next;
  }

  function toggleCampo(key: string) {
    campos = campos.map((c) =>
      c.key === key ? { ...c, seleccionado: !c.seleccionado } : c,
    );
  }

  function selectAll(categoria?: string) {
    campos = campos.map((c) =>
      categoria
        ? c.categoria === categoria
          ? { ...c, seleccionado: true }
          : c
        : { ...c, seleccionado: true },
    );
  }

  function clearAll(categoria?: string) {
    campos = campos.map((c) =>
      categoria
        ? c.categoria === categoria
          ? { ...c, seleccionado: false }
          : c
        : { ...c, seleccionado: false },
    );
  }

  function getCamposFiltrados(categoria: string): CampoSeleccionable[] {
    return campos.filter(
      (c) =>
        c.categoria === categoria &&
        (!busqueda || c.label.toLowerCase().includes(busqueda.toLowerCase())),
    );
  }

  function handleSave() {
    onSave(campos.filter((c) => c.seleccionado).map((c) => c.key));
    isOpen = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const selectedCount = $derived(campos.filter((c) => c.seleccionado).length);
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center px-0 sm:px-4"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="animate-slide-up relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
    >
      <!-- Top accent gradient -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-t-3xl sm:rounded-t-2xl"></div>

      <!-- Handle (mobile) -->
      <div class="flex justify-center pt-3 pb-1 sm:hidden">
        <div class="h-1 w-10 rounded-full bg-slate-300"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-400/30">
            <SlidersHorizontal class="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Campos visibles</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Elige qué mostrar en cada tarjeta
            </p>
          </div>
        </div>
        <button
          onclick={onClose}
          class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
          aria-label="Cerrar"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Search -->
      <div class="border-y border-slate-100 px-5 py-3 sm:px-6">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            bind:value={busqueda}
            placeholder="Buscar campo..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-4 text-sm outline-none transition-all
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white"
          />
        </div>
      </div>

      <!-- Field list -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3 sm:px-6">
        {#each categorias as cat}
          {@const filtrados = getCamposFiltrados(cat.id)}
          {#if filtrados.length > 0}
            <div class="rounded-2xl border {cat.border} overflow-hidden">
              <!-- Category header -->
              <!-- svelte-ignore a11y_interactive_supports_focus -->
              <div
                role="button"
                onclick={() => toggleCategory(cat.id)}
                onkeydown={(e) => e.key === "Enter" && toggleCategory(cat.id)}
                class="flex cursor-pointer items-center justify-between {cat.bg} px-4 py-3 hover:brightness-95 transition-all"
              >
                <div class="flex items-center gap-2.5">
                  <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br {cat.color} shadow-sm">
                    <span class="text-sm leading-none drop-shadow-sm">{cat.icon}</span>
                  </div>
                  <span class="text-sm font-bold text-slate-700"
                    >{cat.label}</span
                  >
                  <span
                    class="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200/40"
                  >
                    {filtrados.filter((c) => c.seleccionado)
                      .length}/{filtrados.length}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      selectAll(cat.id);
                    }}
                    class="text-xs font-semibold text-blue-600 hover:underline"
                    >Todos</button
                  >
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      clearAll(cat.id);
                    }}
                    class="text-xs font-semibold text-slate-400 hover:underline"
                    >Ninguno</button
                  >
                  <svg
                    class="h-4 w-4 text-slate-400 transition-transform duration-200
                      {expandedCategories.has(cat.id) ? 'rotate-180' : ''}"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <!-- Fields grid -->
              {#if expandedCategories.has(cat.id)}
                <div class="grid grid-cols-2 gap-1.5 p-3 bg-white">
                  {#each filtrados as campo}
                    <label
                      class="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all
                        {campo.seleccionado
                        ? 'bg-blue-50/60 border border-blue-200/50'
                        : 'border border-transparent hover:bg-slate-50 hover:border-slate-200/50'}"
                    >
                      <!-- Custom circular checkbox -->
                      <span
                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200
                        {campo.seleccionado
                          ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-300/40 scale-110'
                          : 'border-slate-300 bg-white hover:border-blue-400'}"
                      >
                        {#if campo.seleccionado}
                          <Check class="h-3 w-3 text-white animate-bounce-in" strokeWidth={3} />
                        {/if}
                      </span>
                      <input
                        type="checkbox"
                        checked={campo.seleccionado}
                        onchange={() => toggleCampo(campo.key)}
                        class="sr-only"
                      />
                      <span class="text-xs font-medium {campo.seleccionado ? 'text-blue-700' : 'text-slate-700'}"
                        >{campo.label}</span
                      >
                    </label>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm shadow-blue-400/30"
          >
            {selectedCount}
          </span>
          <span class="text-xs text-slate-500"
            >campo{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !==
            1
              ? "s"
              : ""}</span
          >
        </div>
        <div class="flex gap-2">
          <button
            onclick={onClose}
            class="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
            >Cancelar</button
          >
          <button
            onclick={handleSave}
            class="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
            >Guardar</button
          >
        </div>
      </div>
    </div>
  </div>
{/if}
