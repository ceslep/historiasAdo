# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HistoriasAdo is a dental patient management PWA (Progressive Web App) for orthodontic clinics. It's a Spanish-language, offline-first application that manages patient records ("historias clínicas"), appointments (citas), payments (abonos/pagos), and balances (saldos). Deployed to GitHub Pages at `/historiasAdo/`.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm run check` — Type-check (svelte-check + tsc)
- `npm run deploy` — Build and deploy to GitHub Pages via gh-pages

## Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`) — NOT Svelte 4 stores
- **TypeScript** with strict config
- **Vite 7** as bundler
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (no `tailwind.config` file)
- **Dexie** (IndexedDB wrapper) for local offline storage
- **jsPDF + jspdf-autotable** for PDF generation
- **lucide-svelte** for icons
- **vite-plugin-pwa** with Workbox for service worker / offline caching

## Architecture

### Data Flow
1. On first load, patient data is read from a static JSON file (`src/assets/paciente.json`) and bulk-saved into IndexedDB via Dexie
2. Subsequent loads read from IndexedDB directly (`src/lib/db/db.ts`)
3. The `pacienteStore` (`src/lib/stores/pacienteStore.svelte.ts`) is a Svelte 5 runes-based reactive store (module-level `$state`) that manages the patient list, online/offline status, and sync state
4. Patient history (citas, abonos, saldos, pagos) is fetched on-demand from the remote API (`app.iedeoccidente.com/ado/buscar.php`) via `historialService.ts`

### Key Directories
- `src/lib/types/` — TypeScript interfaces: `Paciente`, `Cita`, `Abono`, `Saldo`, `Pago`, `HistorialData`
- `src/lib/db/db.ts` — Dexie database definition (`HistoriasDB`) with CRUD operations
- `src/lib/services/` — `pacienteService.ts` (load/search patients), `historialService.ts` (fetch history from API)
- `src/lib/stores/` — `pacienteStore.svelte.ts` reactive store with offline-first sync logic
- `src/lib/components/` — Svelte 5 components (search, patient list/card, modals, sidebar, PDF)

### Single-Page Architecture
No router — `App.svelte` is the single entry point managing all state (search, selection, modals). Components communicate via props and callbacks (no global event bus).

### Offline-First Pattern
The store tracks `synced` and `isOnline` flags. When online, it attempts to POST unsynced records to `/api/pacientes/sync`. Patient data persists locally in IndexedDB between sessions.

## Conventions

- All domain terms are in Spanish (paciente, historial, cita, abono, saldo, etc.)
- Patient unique key is `ind` (string), not `id`
- Search requires minimum 3 characters and matches across: nombres, identificacion, historia, telefono_movil, email1
- Components use Svelte 5 syntax: `$state`, `$derived`, `$effect`, `{#snippet}`, `onclick` (not `on:click`)
