<script lang="ts">
  import { untrack } from "svelte";
  import { X, Printer, Download, FileText } from "lucide-svelte";

  interface Props {
    pdfBlob: Blob | null;
    pacienteCount: number;
    isOpen: boolean;
    onClose: () => void;
  }

  let {
    pdfBlob,
    pacienteCount,
    isOpen = $bindable(),
    onClose,
  }: Props = $props();

  let pdfUrl = $state<string | null>(null);
  let iframeRef = $state<HTMLIFrameElement | null>(null);

  $effect(() => {
    if (isOpen && pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      untrack(() => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        pdfUrl = url;
      });
      return () => {
        URL.revokeObjectURL(url);
        untrack(() => {
          if (pdfUrl === url) pdfUrl = null;
        });
      };
    }
  });

  $effect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function handlePrint() {
    if (iframeRef?.contentWindow) iframeRef.contentWindow.print();
  }

  function handleDownload() {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `reporte-pacientes-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  onclick={handleBackdropClick}
  class="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-4"
  role="presentation"
>
  <div
    class="animate-slide-up relative flex h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[90vh] sm:max-w-5xl sm:rounded-2xl"
    role="dialog"
    aria-modal="true"
    aria-label="Vista previa del PDF"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Top accent gradient -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-t-3xl sm:rounded-t-2xl z-10"></div>

    <!-- Mobile handle -->
    <div class="flex justify-center pt-3 pb-1 sm:hidden">
      <div class="h-1 w-10 rounded-full bg-slate-300"></div>
    </div>

    <!-- Header -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-5 py-4 sm:px-6"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-400/30"
        >
          <FileText class="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 sm:text-lg">
            Vista previa
          </h2>
          <p class="text-xs text-slate-500">
            {pacienteCount} paciente{pacienteCount !== 1 ? "s" : ""} · {today}
          </p>
        </div>
      </div>
      <button
        type="button"
        onclick={handleClose}
        class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
        aria-label="Cerrar"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- Viewer -->
    <div class="flex-1 overflow-hidden bg-slate-100 relative">
      <!-- Document pattern background -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, #64748b 1px, transparent 1px); background-size: 16px 16px;"></div>

      {#if pdfUrl}
        <iframe
          bind:this={iframeRef}
          src={pdfUrl}
          class="relative h-full w-full border-0"
          title="Vista previa del PDF"
        ></iframe>
      {:else}
        <div class="relative flex h-full items-center justify-center">
          <div class="flex flex-col items-center gap-4 text-center">
            <!-- Document shimmer animation -->
            <div class="relative">
              <div class="h-20 w-16 rounded-lg bg-white shadow-lg border border-slate-200 overflow-hidden">
                <div class="mt-3 mx-2 space-y-1.5">
                  <div class="skeleton h-1.5 w-full rounded-sm"></div>
                  <div class="skeleton h-1.5 w-4/5 rounded-sm"></div>
                  <div class="skeleton h-1.5 w-full rounded-sm"></div>
                  <div class="skeleton h-1.5 w-3/5 rounded-sm"></div>
                </div>
              </div>
              <div
                class="absolute -right-1 -top-1 h-5 w-5 rounded-full border-2 border-white border-t-blue-500 bg-white"
                style="animation: spin-smooth 0.8s linear infinite;"
              ></div>
            </div>
            <p class="text-sm font-semibold text-slate-500">
              Generando vista previa...
            </p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer with glass -->
    <div
      class="flex shrink-0 flex-col gap-3 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <span class="text-xs font-medium text-slate-500">
        Generado: {today}
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          onclick={handlePrint}
          class="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md hover:scale-[1.02] active:scale-95"
        >
          <Printer class="h-4 w-4" />
          Imprimir
        </button>
        <button
          type="button"
          onclick={handleDownload}
          class="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
        >
          <Download class="h-4 w-4" />
          Descargar
        </button>
      </div>
    </div>
  </div>
</div>
