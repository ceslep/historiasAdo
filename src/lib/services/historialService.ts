import type { HistorialResponse } from '../types/historial';
import { getHistorialCache, saveHistorialCache } from '../db/db';

const API_BASE = 'https://app.iedeoccidente.com/ado/buscar.php';

async function fetchFromApi(historia: string): Promise<HistorialResponse> {
  const url = `${API_BASE}?q=${encodeURIComponent(historia)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let data: HistorialResponse;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Respuesta no es JSON válido');
    }

    if (!data || !Array.isArray(data.results)) {
      throw new Error('Formato de respuesta inválido');
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
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
    const response = await fetchFromApi(historia);
    if (response.results && response.results.length > 0) {
      const histData = response.results[0].data;

      // Guardar en cache de IndexedDB
      try {
        await saveHistorialCache({
          historia,
          citas: histData.citas || [],
          abonos: histData.abonos || [],
          saldos: histData.saldos || [],
          pagos: histData.pagos || [],
          updatedAt: new Date(),
        });
        console.log(`[Historial] Cache guardado para historia #${historia}`);
      } catch (e) {
        console.error('[Historial] Error guardando cache:', e);
      }

      return {
        data: histData,
        source: 'api',
        cachedAt: new Date(),
      };
    }
  } catch (e) {
    console.warn('[Historial] API no disponible:', e);
  }

  // Fallback: buscar en cache local
  try {
    const cached = await getHistorialCache(historia);
    console.log(`[Historial] Cache para #${historia}:`, cached ? 'encontrado' : 'no existe');
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
    console.error('[Historial] Error leyendo cache:', e);
  }

  return { data: null, source: 'none', cachedAt: null };
}

// Mantener export para compatibilidad
export async function fetchHistorial(historia: string): Promise<HistorialResponse> {
  return fetchFromApi(historia);
}
