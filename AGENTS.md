# AGENTS.md - Developer Guidelines for HistoriasAdo

## Project Overview

HistoriasAdo is a Svelte 5 + Vite + TypeScript + TailwindCSS v4 web application for patient medical history management with offline-first capabilities.

## Build / Lint / Test Commands

```bash
npm run dev          # Start Vite dev server with hot reload
npm run build        # Production build with Vite
npm run preview      # Preview production build locally
npm run check        # Type checking (svelte-check + tsc)
npm run deploy       # Build and deploy to GitHub Pages
```

No lint or test framework is configured.

## Code Style Guidelines

### General
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for all reactivity
- Use TypeScript for all files in `src/`, 2-space indentation, single quotes, max 100 chars/line
- Add `lang="ts"` to `<script>` tags

### File Extensions
- Components: `.svelte`, Stores: `.svelte.ts`, Types/Services/DB: `.ts`

### Imports (order: types → services → external libs → components)
```typescript
import type { Paciente } from '../types/paciente';
import { getIniciales } from '../services/pacienteService';
import { History } from 'lucide-svelte';
import Badge from './badge.svelte';
```

### Naming
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
<button onclick={(e) => { e.stopPropagation(); doSomething(); }}>Action</button>
```

### TypeScript
- Use `interface` for shapes, `type` for unions; use `| null` for nullable fields
- Sync types extend base with metadata: `synced`, `updatedAt`, `createdAt`, `deleted`

### Error Handling
- Try/catch with specific errors; handle async errors at component level; use `console.error` for dev logging

### CSS / Tailwind
- Use `@import "tailwindcss";` in CSS files; CSS custom properties in `src/app.css`
- Keep custom CSS minimal; use utility classes; apply `animate-fade-in`, `animate-slide-up`

## Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable Svelte components
│   ├── db/            # IndexedDB (Dexie.js)
│   ├── services/      # Data loading services
│   ├── stores/        # Svelte 5 rune stores (.svelte.ts)
│   └── types/         # TypeScript interfaces
├── App.svelte         # Root component
├── app.css            # Global styles + Tailwind
└── main.ts            # Entry point
```

## Key Dependencies

- **svelte**: ^5.45.x - UI framework with runes
- **tailwindcss**: ^4.2.x - CSS framework (v4)
- **@tailwindcss/vite**: Vite plugin for Tailwind v4
- **dexie**: ^4.3.x - IndexedDB wrapper
- **jspdf** + **jspdf-autotable**: PDF generation
- **lucide-svelte**: ^0.575.x - Icons (named imports only)
- **vite-plugin-pwa**: Service worker / offline caching

## Offline-First Architecture

### IndexedDB (Dexie.js)
- Database: `HistoriasDB` in `src/lib/db/db.ts`
- Table: `pacientes` with indexes: `ind, synced, updatedAt, estado`
- Sync fields: `synced`, `updatedAt`, `createdAt`, `deleted`

### pacienteStore (`src/lib/stores/pacienteStore.svelte.ts`)
Module pattern with getters and methods:
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

### API Endpoints (when backend available)
- `GET /api/pacientes` - Fetch all patients
- `POST /api/pacientes/sync` - Sync local changes

## Common Issues

- **Type errors**: Run `npm run check`
- **Tailwind not working**: Verify `@import "tailwindcss";` in `app.css`
- **Base URL**: `/historiasAdo/` in `vite.config.ts`
- **PWA not updating**: Clear service worker cache or use `registerType: "autoUpdate"`

## Testing

No test framework configured. If adding tests:
- **Vitest**: `npx vitest run --testNamePattern="test name"` for single test
- **Playwright**: `npx playwright test --grep="test name"` for e2e

## State Management

### Svelte 5 Rune Patterns
- Use `$state` for primitive values and objects that need reactivity
- Use `$derived` for computed values that depend on state
- Use `$effect` for side effects (logging, syncing, DOM manipulation)
- Use `$props` for component inputs with optional defaults
- Use `$inspect` for debugging: `$inspect(value)` or `$inspect.trace()`

### Store Pattern (Module with Getters)
```typescript
// src/lib/stores/exampleStore.svelte.ts
let items = $state<Item[]>([]);

export const exampleStore = {
  get items() { return items; },
  add(item: Item) { items = [...items, item]; },
};
```

### When to Use Stores vs Local State
- **Store**: Global state shared across components, persisted data, sync logic
- **Local `$state`**: Component-specific UI state, form inputs, modals

## Component Structure

### Props Interface
```typescript
interface Props {
  title: string;
  items: Item[];
  onSave?: (item: Item) => void;
  variant?: 'primary' | 'secondary';
}

let { title, items, onSave, variant = 'primary' }: Props = $props();
```

### Event Handlers
```typescript
function handleSubmit(e: Event) {
  e.preventDefault();
  onSave?.(formData);
}

function handleClick(e: MouseEvent) {
  e.stopPropagation();
  doAction();
}
```

## Database Operations

### Dexie.js Patterns
```typescript
// Async operations return promises
const pacientes = await db.pacientes.where('synced').equals(0).toArray();

// Batch updates
await db.pacientes.bulkPut(updatedRecords);

// Always handle errors
try {
  await db.pacientes.add(paciente);
} catch (error) {
  if (error instanceof Error && error.name === 'ConstraintError') {
    console.error('Paciente ya existe');
  }
}
```

## Forms

- Use `onsubmit` with `e.preventDefault()` for form handling
- Use `$state` for form data objects
- Validate before submission; show inline errors
- Use `bind:value` for two-way binding

## Accessibility

- Include `alt` text for images; use semantic HTML
- Add `aria-label` for icon-only buttons, `title` for tooltips
- Use `// svelte-ignore a11y_click_events_have_key_events` when appropriate

## Git Conventions

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`. Keep commits atomic.

## Editor Setup

Recommended: Svelte for VS Code, TailwindCSS IntelliSense, TypeScript Language Features. Enable "Format on Save".
