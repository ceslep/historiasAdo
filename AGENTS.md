# AGENTS.md - Developer Guidelines for HistoriasAdo

## Project Overview
Svelte 5 + Vite + TypeScript + TailwindCSS v4 web application for patient medical history management with offline-first capabilities.

## Build / Lint / Test Commands

```bash
npm run dev          # Start Vite dev server with hot reload (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run check        # Type checking (svelte-check + tsc)
npm run deploy       # GitHub Pages

No test framework is currently configured. For testing, add Vitest or Playwright.

## Code Style

### General
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for all reactivity
- TypeScript in `src/`, 2-space indent, single quotes, max 100 chars/line
- Add `lang="ts"` to `<script>` tags
- Use semantic HTML elements (`<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`)

### File Extensions
- Components: `.svelte`, Stores: `.svelte.ts`, Types/Services/DB: `.ts`

### Imports Order (strict)
1. Type imports (`import type`)
2. Service/utility imports
3. Named icon imports from `lucide-svelte`
4. Component imports (relative paths)
5. CSS/style imports last

```typescript
import type { Paciente } from '../types/paciente';
import { getIniciales } from '../services/pacienteService';
import { History, User, Plus } from 'lucide-svelte';
import Badge from './badge.svelte';
import './form.css';
```

### Naming Conventions
- Files: `kebab-case`, Types/Classes: `PascalCase`, Variables/Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`, Props interfaces: `XxxProps`

### Svelte 5 Patterns
```svelte
interface Props { paciente: Paciente; count?: number; }
let { paciente, count = 0 }: Props = $props();
let showModal = $state(false);
const initials = $derived(getIniciales(paciente.nombres));
$effect(() => { console.log('count changed'); });
<button onclick={handleClick}>Click</button>
```

### TypeScript
- Use `interface` for object shapes, `type` for unions/aliases
- Use `| null` for nullable fields (not `undefined` for optional)
- Sync fields: `synced`, `updatedAt`, `createdAt`, `deleted`

### Error Handling
- Always use try/catch for async operations
- Catch specific error types; handle at component level
- Use `console.error` for dev logging; user-friendly messages for UI

### CSS / Tailwind
- Use `@import "tailwindcss";` in CSS files (v4 syntax)
- Define CSS custom properties in `src/app.css`

## Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable Svelte components
│   ├── db/            # IndexedDB (Dexie.js)
│   ├── services/      # Data loading/API services
│   ├── stores/        # Svelte 5 rune stores (.svelte.ts)
│   └── types/         # TypeScript interfaces
├── App.svelte         # Root component
├── app.css            # Global styles + Tailwind
└── main.ts            # Entry point
```

## Key Dependencies
- **svelte**: ^5.45.x - UI framework with runes
- **tailwindcss**: ^4.2.x - CSS framework (v4)
- **dexie**: ^4.3.x - IndexedDB wrapper
- **jspdf** + **jspdf-autotable**: PDF generation
- **lucide-svelte**: ^0.575.x - Icons (named imports only)
- **vite-plugin-pwa**: Service worker / offline caching

## Offline-First Architecture

### IndexedDB (Dexie.js)
Database: `HistoriasDB` in `src/lib/db/db.ts`, table: `pacientes` with indexes: `ind, synced, updatedAt, estado`

### pacienteStore (`src/lib/stores/pacienteStore.svelte.ts`)
```typescript
export const pacienteStore = {
  get pacientes() { return pacientesState; },
  get isOnline() { return isOnlineState; },
  get pendingSyncCount() { return pendingSyncCountState; },
  get isLoading() { return isLoadingState; },
  get error() { return errorState; },
  inicializar: inicializarStore,
  guardar: guardarPacienteLocal,
  actualizar: actualizarPaciente,
  eliminar: eliminarPacienteLocal,
  sincronizar: forzarSincronizacion,
  recargar: recargarDatos,
};
```

| Rune | Use Case |
|------|----------|
| `$state` | Reactive primitives/objects |
| `$derived` | Computed values (memoized) |
| `$effect` | Side effects (cleanup returned) |
| `$props` | Component inputs |
| `$inspect` | Debugging (dev only) |

## Component Structure
```typescript
interface Props { title: string; items: Item[]; onSave?: (item: Item) => void; variant?: 'primary' | 'secondary'; }
let { title, items, onSave, variant = 'primary' }: Props = $props();
```

## Database Operations (Dexie.js)
```typescript
const pending = await db.pacientes.where('synced').equals(0).toArray();
await db.pacientes.bulkPut(updatedRecords);
try {
  await db.pacientes.add(paciente);
} catch (error) {
  if (error instanceof Error && error.name === 'ConstraintError') {
    console.error('Paciente ya existe');
  }
}
```

## Forms
- Use `onsubmit` with `e.preventDefault()`
- Use `$state` for form data; `bind:value` for two-way binding
- Validate before submission

## Accessibility
- Include `alt` text for images; use semantic HTML
- Add `aria-label` for icon-only buttons, `title` for tooltips

## Common Issues
- **Type errors**: Run `npm run check`
- **Tailwind not working**: Verify `@import "tailwindcss";` in `app.css`
- **Base URL**: `/historiasAdo/` in `vite.config.ts`
- **PWA not updating**: Clear service worker cache or increment version in `vite.config.ts`

## Git Conventions
Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
