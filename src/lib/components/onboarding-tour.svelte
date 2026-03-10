<script lang="ts">
  import { onMount } from "svelte";
  import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-svelte";

  interface Props {
    onComplete: () => void;
    onSearch: (query: string) => void;
  }

  let { onComplete, onSearch }: Props = $props();

  let currentStep = $state(0);
  let isExiting = $state(false);
  let isReady = $state(false);
  let waitingForTarget = $state(false);

  // Spotlight rect (position of highlighted element)
  let spotRect = $state({ top: 0, left: 0, width: 0, height: 0 });
  // Tooltip position
  let tipPos = $state<"bottom" | "top">("bottom");

  interface TourStep {
    target: string;
    title: string;
    description: string;
    tip: string;
    color: string;
    position: "bottom" | "top" | "auto";
    beforeShow?: () => void;
  }

  const DEMO_QUERY = "2547";

  const steps: TourStep[] = [
    {
      target: "search-input",
      title: "Barra de busqueda",
      description:
        "Escribe al menos 3 caracteres para buscar pacientes por nombre, identificacion, historia o telefono.",
      tip: 'Ejemplo: escribe "garcia" para encontrar todos los Garcia.',
      color: "blue",
      position: "bottom",
    },
    {
      target: "search-input",
      title: "Busqueda con comodines",
      description:
        "Usa * para cualquier texto y ? para un solo caracter. Con comodines basta 1 caracter real.",
      tip: '"r*z" encuentra "ruiz", "rodriguez". "ga?cia" encuentra "garcia".',
      color: "violet",
      position: "bottom",
    },
    {
      target: "filtros-estado",
      title: "Filtrar por estado",
      description:
        "Filtra los resultados mostrando solo pacientes Activos, Inactivos o Todos.",
      tip: "El filtro se aplica junto con la busqueda de texto.",
      color: "emerald",
      position: "bottom",
    },
    {
      target: "columnas-btn",
      title: "Personalizar columnas",
      description:
        "Elige que campos se muestran en las tarjetas de pacientes: telefono, historia, tipo, etc.",
      tip: "Puedes cambiar las columnas en cualquier momento.",
      color: "amber",
      position: "bottom",
    },
    {
      target: "patient-card",
      title: "Tarjetas de pacientes",
      description:
        'Cada tarjeta muestra la informacion del paciente. Vamos a buscar "' +
        DEMO_QUERY +
        '" para verlo en accion.',
      tip: "Haz clic en cualquier parte de la tarjeta para seleccionarla. El check aparece arriba a la izquierda.",
      color: "cyan",
      position: "auto",
      beforeShow: () => onSearch(DEMO_QUERY),
    },
    {
      target: "historial-btn",
      title: "Ver historial clinico",
      description:
        'Este boton abre el historial completo del paciente: citas, abonos, saldos y pagos.',
      tip: "El historial se consulta en linea desde el servidor del consultorio.",
      color: "rose",
      position: "auto",
    },
  ];

  const totalSteps = steps.length;

  const colors: Record<
    string,
    { ring: string; dot: string; btn: string; bg: string; border: string }
  > = {
    blue: {
      ring: "ring-blue-400/50",
      dot: "bg-blue-500",
      btn: "bg-blue-600 hover:bg-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    violet: {
      ring: "ring-violet-400/50",
      dot: "bg-violet-500",
      btn: "bg-violet-600 hover:bg-violet-700",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
    emerald: {
      ring: "ring-emerald-400/50",
      dot: "bg-emerald-500",
      btn: "bg-emerald-600 hover:bg-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    amber: {
      ring: "ring-amber-400/50",
      dot: "bg-amber-500",
      btn: "bg-amber-600 hover:bg-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    cyan: {
      ring: "ring-cyan-400/50",
      dot: "bg-cyan-500",
      btn: "bg-cyan-600 hover:bg-cyan-700",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
    },
    rose: {
      ring: "ring-rose-400/50",
      dot: "bg-rose-500",
      btn: "bg-rose-600 hover:bg-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
    },
  };

  const PADDING = 8;

  function getTargetEl(target: string): Element | null {
    return document.querySelector(`[data-tour="${target}"]`);
  }

  function getTargetRect(target: string): DOMRect | null {
    const el = getTargetEl(target);
    if (!el) return null;
    return el.getBoundingClientRect();
  }

  function updateSpotlight() {
    const step = steps[currentStep];
    const el = getTargetEl(step.target);

    if (!el) {
      // Target not in DOM yet — wait and retry
      waitingForTarget = true;
      const retryInterval = setInterval(() => {
        const found = getTargetEl(step.target);
        if (found) {
          clearInterval(retryInterval);
          waitingForTarget = false;
          positionOnElement(step, found);
        }
      }, 100);
      // Safety: stop after 3s
      setTimeout(() => {
        clearInterval(retryInterval);
        waitingForTarget = false;
      }, 3000);
      return;
    }

    positionOnElement(step, el);
  }

  function positionOnElement(step: TourStep, el: Element) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();

      spotRect = {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };

      if (step.position === "auto") {
        const spaceBelow = window.innerHeight - rect.bottom;
        tipPos = spaceBelow > 240 ? "bottom" : "top";
      } else {
        tipPos = step.position;
      }
    });
  }

  function goToStep(idx: number) {
    currentStep = idx;
    const step = steps[idx];
    if (step.beforeShow) {
      step.beforeShow();
      // Give time for DOM to update after search
      setTimeout(() => updateSpotlight(), 350);
    } else {
      updateSpotlight();
    }
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    } else {
      close();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }

  function close() {
    isExiting = true;
    // Clear the demo search
    onSearch("");
    setTimeout(() => onComplete(), 300);
  }

  onMount(() => {
    setTimeout(() => {
      updateSpotlight();
      isReady = true;
    }, 400);

    function onResize() {
      updateSpotlight();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  let step = $derived(steps[currentStep]);
  let c = $derived(colors[step.color]);

  let tooltipStyle = $derived.by(() => {
    const maxW = 360;
    let left = spotRect.left + spotRect.width / 2 - maxW / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - maxW - 12));

    if (tipPos === "bottom") {
      const top = spotRect.top + spotRect.height + 14;
      return `top:${top}px;left:${left}px;max-width:${maxW}px;`;
    } else {
      const bottom = window.innerHeight - spotRect.top + 14;
      return `bottom:${bottom}px;left:${left}px;max-width:${maxW}px;`;
    }
  });
</script>

{#if isReady}
  <!-- Full-screen overlay with spotlight cutout -->
  <div
    class="fixed inset-0 z-[60] transition-opacity duration-300
      {isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
    role="dialog"
    aria-modal="true"
    aria-label="Tutorial interactivo"
  >
    <!-- Dark overlay with hole (SVG mask) -->
    <svg class="absolute inset-0 h-full w-full" style="pointer-events:none;">
      <defs>
        <mask id="tour-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
          <rect
            x={spotRect.left}
            y={spotRect.top}
            width={spotRect.width}
            height={spotRect.height}
            rx="16"
            fill="black"
            class="transition-all duration-500 ease-out"
          ></rect>
        </mask>
      </defs>
      <rect
        x="0" y="0" width="100%" height="100%" fill="rgba(15,23,42,0.6)"
        mask="url(#tour-mask)"
        style="pointer-events:all;cursor:pointer;"
        role="button"
        tabindex="-1"
        aria-label="Cerrar tutorial"
        onclick={close}
        onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); }}
      ></rect>
    </svg>

    <!-- Spotlight ring (animated glow) -->
    <div
      class="fixed rounded-2xl ring-4 {c.ring} transition-all duration-500 ease-out pointer-events-none"
      style="top:{spotRect.top}px;left:{spotRect.left}px;width:{spotRect.width}px;height:{spotRect.height}px;"
    >
      <div class="absolute inset-0 rounded-2xl animate-pulse ring-2 {c.ring}"></div>
    </div>

    <!-- Arrow pointer -->
    {#if tipPos === "bottom"}
      <div
        class="fixed pointer-events-none transition-all duration-500 ease-out"
        style="top:{spotRect.top + spotRect.height - 2}px;left:{spotRect.left + spotRect.width / 2 - 10}px;"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" class="drop-shadow-lg">
          <path d="M10 14 L0 0 L20 0 Z" fill="white"></path>
        </svg>
      </div>
    {:else}
      <div
        class="fixed pointer-events-none transition-all duration-500 ease-out"
        style="top:{spotRect.top - 12}px;left:{spotRect.left + spotRect.width / 2 - 10}px;"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" class="drop-shadow-lg">
          <path d="M10 0 L20 14 L0 14 Z" fill="white"></path>
        </svg>
      </div>
    {/if}

    <!-- Tooltip card -->
    <div
      class="fixed z-[61] w-full transition-all duration-500 ease-out"
      style={tooltipStyle}
    >
      {#key currentStep}
        <div
          class="rounded-2xl border {c.border} bg-white shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in"
        >
          <!-- Color bar top -->
          <div class="h-1.5 w-full {c.dot}"></div>

          <div class="px-5 pt-4 pb-5">
            <!-- Header row -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="rounded-full {c.bg} {c.border} border px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {currentStep + 1}/{totalSteps}
                </span>
                <span class="flex items-center gap-1 text-xs text-slate-400">
                  <Sparkles class="h-3 w-3" />
                  Guia
                </span>
              </div>
              <button
                onclick={close}
                class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-90"
                aria-label="Cerrar tutorial"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- Title + description -->
            <h3 class="mt-3 text-base font-bold text-slate-800">{step.title}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-slate-600">
              {step.description}
            </p>

            <!-- Tip -->
            <div class="mt-3 rounded-xl {c.bg} border {c.border} px-3.5 py-2.5">
              <p class="text-xs leading-relaxed text-slate-600">
                <span class="font-bold text-slate-700">Tip:</span>
                {step.tip}
              </p>
            </div>

            <!-- Dots + nav -->
            <div class="mt-4 flex items-center gap-3">
              <!-- Dots -->
              <div class="flex gap-1.5">
                {#each steps as _, i}
                  <button
                    onclick={() => goToStep(i)}
                    class="h-2 rounded-full transition-all duration-300
                      {i === currentStep
                      ? 'w-5 ' + c.dot
                      : 'w-2 bg-slate-300 hover:bg-slate-400'}"
                    aria-label="Paso {i + 1}"
                  ></button>
                {/each}
              </div>

              <div class="flex-1"></div>

              <!-- Buttons -->
              {#if currentStep > 0}
                <button
                  onclick={prevStep}
                  class="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                >
                  <ChevronLeft class="h-3.5 w-3.5" />
                  Ant.
                </button>
              {:else}
                <button
                  onclick={close}
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:bg-slate-50 active:scale-95"
                >
                  Omitir
                </button>
              {/if}

              <button
                onclick={nextStep}
                class="flex items-center gap-1 rounded-lg {c.btn} px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                {#if currentStep < totalSteps - 1}
                  Siguiente
                  <ChevronRight class="h-3.5 w-3.5" />
                {:else}
                  Comenzar
                  <Sparkles class="h-3.5 w-3.5" />
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/key}
    </div>
  </div>
{/if}
