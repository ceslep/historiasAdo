<script lang="ts">
  import type { Paciente } from "../types/paciente";
  import { getIniciales } from "../services/pacienteService";
  import Badge from "./badge.svelte";
  import {
    X,
    Trash2,
    Users,
    FileText,
    Phone,
    ChevronRight,
  } from "lucide-svelte";
  import { jsPDF } from "jspdf";
  import autoTable from "jspdf-autotable";

  interface Props {
    pacientes: Paciente[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onViewDetails?: (paciente: Paciente) => void;
    onGenerarPDF?: (blob: Blob) => void;
    isOpen: boolean;
    onClose: () => void;
  }

  let {
    pacientes,
    onRemove,
    onClear,
    onViewDetails,
    onGenerarPDF,
    isOpen,
    onClose,
  }: Props = $props();

  const count = $derived(pacientes.length);

  function generarPDF(): Blob {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    const now = new Date();
    const fecha = now.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const hora = now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const activos = pacientes.filter((p) => p.estado === "ACTIVO").length;
    const inactivos = pacientes.filter((p) => p.estado === "INACTIVO").length;

    // ── Paleta ─────────────────────────────────────────────────────
    const C_brand: [number, number, number] = [30, 58, 138];
    const C_brandMid: [number, number, number] = [59, 130, 246];
    const C_brandLight: [number, number, number] = [239, 246, 255];
    const C_success: [number, number, number] = [16, 185, 129];
    const C_danger: [number, number, number] = [239, 68, 68];
    const C_dark: [number, number, number] = [15, 23, 42];
    const C_mid: [number, number, number] = [71, 85, 105];
    const C_light: [number, number, number] = [148, 163, 184];
    const C_row: [number, number, number] = [248, 250, 252];
    const C_white: [number, number, number] = [255, 255, 255];
    const C_successBg: [number, number, number] = [236, 253, 245];
    const C_dangerBg: [number, number, number] = [254, 242, 242];

    doc.setFillColor(...C_brand);
    doc.rect(0, 0, pw, 36, "F");

    doc.setFillColor(...C_brandMid);
    doc.rect(0, 33, pw, 3, "F");

    doc.setFillColor(...C_white);
    doc.roundedRect(10, 7, 20, 20, 3, 3, "F");
    doc.setFillColor(...C_brandMid);
    doc.rect(17.5, 10, 5, 14, "F");
    doc.rect(13, 14.5, 14, 5, "F");
    doc.setFillColor(...C_white);
    doc.rect(18.5, 11, 3, 12, "F");
    doc.rect(14, 15.5, 12, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...C_white);
    doc.text("HistoriasAdo", 35, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(186, 209, 255);
    doc.text("Sistema de Gestión de Historias Clínicas Odontológicas", 35, 25);

    doc.setFontSize(8);
    doc.text(`${fecha}  ·  ${hora}`, pw - 14, 25, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C_dark);
    doc.text("Reporte de Pacientes Seleccionados", 14, 46);

    doc.setDrawColor(...C_brandMid);
    doc.setLineWidth(0.5);
    doc.line(14, 49, pw - 14, 49);

    const stats: Array<{
      label: string;
      value: string;
      color: [number, number, number];
      bg: [number, number, number];
    }> = [
      {
        label: "Total pacientes",
        value: String(count),
        color: C_brand,
        bg: C_brandLight,
      },
      {
        label: "Activos",
        value: String(activos),
        color: C_success,
        bg: C_successBg,
      },
      {
        label: "Inactivos",
        value: String(inactivos),
        color: C_danger,
        bg: C_dangerBg,
      },
    ];

    const cardW = (pw - 28 - 8) / 3;
    let cx = 14;
    for (const s of stats) {
      doc.setFillColor(220, 225, 235);
      doc.roundedRect(cx + 0.5, 52.5, cardW, 18, 3, 3, "F");
      doc.setFillColor(...s.bg);
      doc.roundedRect(cx, 52, cardW, 18, 3, 3, "F");
      doc.setFillColor(...s.color);
      doc.roundedRect(cx, 52, 2.5, 18, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...s.color);
      doc.text(s.value, cx + cardW / 2 + 1, 63.5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...C_mid);
      doc.text(s.label.toUpperCase(), cx + cardW / 2 + 1, 68, {
        align: "center",
      });
      cx += cardW + 4;
    }

    const tableData = pacientes.map((p, idx) => [
      String(idx + 1),
      `#${p.historia}`,
      p.nombres || "-",
      `${p.tdei ?? ""} ${p.identificacion ?? ""}`.trim(),
      p.edad ? `${p.edad} años` : "-",
      p.sexo || "-",
      p.telefono_movil || p.telefono_residencia1 || "-",
      p.tipo || "-",
      p.estado,
    ]);

    autoTable(doc, {
      startY: 76,
      head: [
        [
          "#",
          "Historia",
          "Nombre completo",
          "Identificación",
          "Edad",
          "Sexo",
          "Teléfono",
          "Tipo tratamiento",
          "Estado",
        ],
      ],
      body: tableData,
      theme: "plain",

      headStyles: {
        fillColor: C_brand,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
        halign: "left",
        lineWidth: 0,
      },

      bodyStyles: {
        fontSize: 7.5,
        textColor: C_dark,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        lineColor: [226, 232, 240] as [number, number, number],
        lineWidth: { bottom: 0.3 } as never,
      },

      alternateRowStyles: { fillColor: C_row },

      columnStyles: {
        0: {
          cellWidth: 8,
          halign: "center",
          fontStyle: "bold",
          textColor: C_light,
        },
        1: { cellWidth: 18, fontStyle: "bold", textColor: C_brand },
        2: { cellWidth: 42 },
        3: { cellWidth: 28 },
        4: { cellWidth: 14, halign: "center" },
        5: { cellWidth: 12, halign: "center" },
        6: { cellWidth: 24 },
        7: { cellWidth: 24 },
        8: { cellWidth: 16, halign: "center" },
      },

      margin: { left: 14, right: 14, top: 0, bottom: 18 },

      willDrawCell(data) {
        if (data.column.index === 8 && data.section === "body") {
          data.cell.text = [];
        }
      },

      didDrawCell(data) {
        if (data.column.index === 8 && data.section === "body") {
          const val = String(data.cell.raw ?? "");
          const isActive = val === "ACTIVO";
          const bgColor: [number, number, number] = isActive
            ? [209, 250, 229]
            : [254, 226, 226];
          const txtColor: [number, number, number] = isActive
            ? [4, 120, 87]
            : [185, 28, 28];
          const { x, y, width, height } = data.cell;
          const pad = 1.5;
          doc.setFillColor(...bgColor);
          doc.roundedRect(
            x + pad,
            y + pad,
            width - pad * 2,
            height - pad * 2,
            1.5,
            1.5,
            "F",
          );
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.setTextColor(...txtColor);
          doc.text(val, x + width / 2, y + height / 2 + 0.8, {
            align: "center",
          });
        }
      },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(...C_brand);
      doc.rect(0, ph - 12, pw, 12, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C_white);
      doc.text("HistoriasAdo — Sistema de Gestión de Pacientes", 14, ph - 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(186, 209, 255);
      doc.text(`Página ${i} de ${pageCount}`, pw - 14, ph - 5, {
        align: "right",
      });

      doc.setTextColor(186, 209, 255);
      doc.text(fecha, pw / 2, ph - 5, { align: "center" });
    }

    return doc.output("blob");
  }

  function handleGenerarPDF() {
    const blob = generarPDF();
    if (onGenerarPDF) onGenerarPDF(blob);
  }
</script>

<!-- Mobile overlay -->
{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    onclick={onClose}
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Sidebar -->
<aside
  class="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white/95 backdrop-blur-md shadow-2xl shadow-slate-900/20 transition-transform duration-300 ease-out
  {isOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:relative lg:z-30 lg:h-auto lg:min-h-screen lg:w-72 lg:translate-x-0 lg:border-r lg:border-slate-200/80 lg:shadow-none lg:backdrop-blur-none lg:bg-white"
>
  <!-- Header with glass effect -->
  <div
    class="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 relative overflow-hidden"
  >
    <!-- Gradient bottom border -->
    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-40"></div>

    <div class="flex items-center gap-2.5">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-400/30"
      >
        <Users class="h-4 w-4 text-white" />
      </div>
      <div>
        <p class="text-xs font-bold text-slate-800">Seleccionados</p>
        <p class="text-[11px] text-slate-500">
          {#if count === 0}
            Sin pacientes
          {:else}
            {count} paciente{count !== 1 ? "s" : ""}
          {/if}
        </p>
      </div>
    </div>
    <button
      onclick={onClose}
      class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95 lg:hidden"
      aria-label="Cerrar"
    >
      <X class="h-4 w-4" />
    </button>
  </div>

  <!-- Actions -->
  {#if count > 0}
    <div class="flex shrink-0 gap-2 border-b border-slate-100 px-4 py-3">
      <button
        onclick={handleGenerarPDF}
        class="group/pdf flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-95 relative overflow-hidden"
      >
        <!-- Shimmer effect on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/pdf:translate-x-full transition-transform duration-700"></div>
        <FileText class="h-4 w-4 relative" />
        <span class="relative">Generar PDF</span>
      </button>
      <button
        onclick={onClear}
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200/80 text-red-500 transition-all hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-red-300/30 hover:scale-110 active:scale-95"
        aria-label="Limpiar selección"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
  {/if}

  <!-- Patient list -->
  <div class="flex-1 overflow-y-auto">
    {#if count === 0}
      <div
        class="flex flex-col items-center justify-center px-6 py-14 text-center animate-fade-in"
      >
        <div class="relative mb-5">
          <!-- Decorative ring -->
          <div
            class="absolute inset-0 -m-3 rounded-full border-2 border-dashed border-slate-200/50"
            style="animation: spin-smooth 15s linear infinite;"
          ></div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner ring-4 ring-slate-100/50"
          >
            <Users class="h-7 w-7 text-slate-400" />
          </div>
        </div>
        <p class="text-sm font-bold text-slate-700">Sin selección</p>
        <p class="mt-1.5 text-xs text-slate-400 leading-relaxed">
          Usa el checkbox en cada tarjeta para agregar pacientes
        </p>
      </div>
    {:else}
      <ul class="divide-y divide-slate-100/60 py-1">
        {#each pacientes as paciente (paciente.ind)}
          {@const initials = getIniciales(paciente.nombres)}
          {@const isActivo = paciente.estado === "ACTIVO"}
          <li class="group/item relative px-4 py-3 transition-all hover:bg-slate-50/60">
            <!-- Hover accent bar -->
            <div class="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full bg-blue-500 opacity-0 transition-all group-hover/item:opacity-100"></div>

            <div class="flex items-start gap-3">
              <!-- Avatar with status dot -->
              <div class="relative shrink-0">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover/item:scale-105
                  {isActivo
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-300/30'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-sm shadow-slate-300/30'}
                  text-xs font-bold"
                >
                  {initials}
                </div>
                <!-- Status dot -->
                <div class="absolute -bottom-0.5 -right-0.5">
                  <span class="flex h-2.5 w-2.5 rounded-full border-2 border-white
                    {isActivo ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                </div>
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-1">
                  <p
                    class="truncate text-xs font-bold text-slate-900 leading-snug"
                  >
                    {paciente.nombres}
                  </p>
                  <span
                    class="ml-1 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
                  >
                    #{paciente.historia}
                  </span>
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant={isActivo ? "success" : "neutral"} size="sm">
                    {paciente.estado}
                  </Badge>
                  {#if paciente.telefono_movil}
                    <span
                      class="flex items-center gap-1 text-[11px] text-slate-400"
                    >
                      <Phone class="h-3 w-3" />
                      {paciente.telefono_movil}
                    </span>
                  {/if}
                </div>

                <div class="mt-2 flex items-center gap-3">
                  {#if onViewDetails}
                    <button
                      onclick={() => onViewDetails!(paciente)}
                      class="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Detalles <ChevronRight class="h-3 w-3" />
                    </button>
                  {/if}
                  <button
                    onclick={() => onRemove(paciente.ind)}
                    class="flex items-center gap-0.5 text-xs font-medium text-red-400 transition-all hover:text-red-600 hover:scale-105 active:scale-95"
                  >
                    <X class="h-3 w-3" />
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</aside>
