import type { HistorialResponse } from '../types/historial';
import { getHistorialCache, saveHistorialCache } from '../db/db';
import type { HistorialCache } from '../db/db';

const API_BASE = 'https://app.iedeoccidente.com/ado/buscar.php';

async function fetchFromApi(historia: string): Promise<HistorialResponse> {
  const url = `${API_BASE}?q=${encodeURIComponent(historia)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
      throw new Error('Respuesta no es JSON (posiblemente cacheada por SW)');
    }

    const data = await response.json() as HistorialResponse;

    if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
      throw new Error('Formato de respuesta inválido');
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchHistorial(historia: string): Promise<HistorialResponse> {
  const data = await fetchFromApi(historia);

  // Guardar en cache de IndexedDB
  if (data.results && data.results.length > 0) {
    const histData = data.results[0].data;
    try {
      await saveHistorialCache({
        historia,
        citas: histData.citas || [],
        abonos: histData.abonos || [],
        saldos: histData.saldos || [],
        pagos: histData.pagos || [],
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error('Error guardando historial en cache:', e);
    }
  }

  return data;
}

/**
 * Obtiene el historial intentando primero desde la API.
 * Si falla (offline), usa el cache local de IndexedDB.
 */
export async function fetchHistorialConCache(historia: string): Promise<{
  data: {
    citas: import('../types/historial').Cita[];
    abonos: import('../types/historial').Abono[];
    saldos: import('../types/historial').Saldo[];
    pagos: import('../types/historial').Pago[];
  } | null;
  source: 'api' | 'cache' | 'none';
  cachedAt: Date | null;
}> {
  // Intentar desde la API primero
  try {
    const response = await fetchHistorial(historia);
    if (response.results && response.results.length > 0) {
      return {
        data: response.results[0].data,
        source: 'api',
        cachedAt: new Date(),
      };
    }
  } catch (e) {
    console.warn('API no disponible, buscando en cache local:', e);
  }

  // Fallback: buscar en cache local
  try {
    const cached = await getHistorialCache(historia);
    if (cached) {
      return {
        data: {
          citas: cached.citas,
          abonos: cached.abonos,
          saldos: cached.saldos,
          pagos: cached.pagos,
        },
        source: 'cache',
        cachedAt: cached.updatedAt,
      };
    }
  } catch (e) {
    console.error('Error leyendo cache de historial:', e);
  }

  return { data: null, source: 'none', cachedAt: null };
}
