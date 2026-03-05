import type { HistorialResponse } from '../types/historial';

const API_BASE = 'https://app.iedeoccidente.com/ado/buscar.php';

export async function fetchHistorial(historia: string): Promise<HistorialResponse> {
  const url = `${API_BASE}?q=${encodeURIComponent(historia)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching historial: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as HistorialResponse;
}
