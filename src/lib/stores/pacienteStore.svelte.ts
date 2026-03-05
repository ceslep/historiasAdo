const isBrowser = typeof window !== 'undefined';
import {
  getAllPacientes,
  savePaciente,
  updatePaciente,
  deletePaciente,
  getUnsyncedPacientes,
  markAsSynced,
  clearAllPacientes,
  bulkSavePacientes,
  getUnsyncedCount,
  type PacienteSync,
} from '../db/db';
import { cargarPacientes } from '../services/pacienteService';

const API_BASE_URL = '/api/pacientes';

let pacientesState = $state<PacienteSync[]>([]);
let isOnlineState = $state(isBrowser ? navigator.onLine : true);
let pendingSyncCountState = $state(0);
let isLoadingState = $state(false);
let errorState = $state<string | null>(null);

function updateOnlineStatus() {
  isOnlineState = isBrowser ? navigator.onLine : true;
  if (isOnlineState) {
    sincronizarConAPI();
  }
}

async function sincronizarConAPI(): Promise<void> {
  if (!isOnlineState) {
    return;
  }

  try {
    const unsynced = await getUnsyncedPacientes();
    
    if (unsynced.length === 0) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pacientes: unsynced }),
    });

    if (!response.ok) {
      throw new Error(`Error en sincronización: ${response.status}`);
    }

    const syncedIds = unsynced.map((p) => p.ind);
    await markAsSynced(syncedIds);
    
    await actualizarPendingSyncCount();
    
    await cargarDesdeIndexedDB();
  } catch (error) {
    console.error('Error al sincronizar con el servidor:', error);
  }
}

async function cargarDesdeIndexedDB(): Promise<void> {
  isLoadingState = true;
  errorState = null;

  try {
    const localPacientes = await getAllPacientes();
    
    if (localPacientes.length > 0) {
      pacientesState = localPacientes;
    } else {
      await cargarDesdeJSON();
    }
    
    await actualizarPendingSyncCount();
  } catch (error) {
    console.error('Error al cargar desde IndexedDB:', error);
    errorState = 'Error al cargar datos locales';
  } finally {
    isLoadingState = false;
  }
}

async function cargarDesdeJSON(): Promise<void> {
  try {
    const jsonPacientes = await cargarPacientes();
    
    const pacientesConMeta: PacienteSync[] = jsonPacientes.map((p) => ({
      ...p,
      synced: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    }));

    await bulkSavePacientes(pacientesConMeta);
    pacientesState = pacientesConMeta;
  } catch (error) {
    console.error('Error al cargar desde JSON:', error);
    errorState = 'Error al cargar datos iniciales';
  }
}

async function actualizarPendingSyncCount(): Promise<void> {
  pendingSyncCountState = await getUnsyncedCount();
}

async function guardarPacienteLocal(
  paciente: Omit<PacienteSync, 'synced' | 'updatedAt' | 'createdAt'>
): Promise<void> {
  try {
    await savePaciente({ ...paciente, synced: false });
    
    await actualizarPendingSyncCount();
    
    await cargarDesdeIndexedDB();
    
    if (isOnlineState) {
      sincronizarConAPI();
    }
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    errorState = 'Error al guardar paciente';
    throw error;
  }
}

async function actualizarPaciente(ind: string, changes: Partial<PacienteSync>): Promise<void> {
  try {
    await updatePaciente(ind, changes);
    
    await actualizarPendingSyncCount();
    
    await cargarDesdeIndexedDB();
    
    if (isOnlineState) {
      sincronizarConAPI();
    }
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    errorState = 'Error al actualizar paciente';
    throw error;
  }
}

async function eliminarPacienteLocal(ind: string): Promise<void> {
  try {
    await deletePaciente(ind);
    
    await actualizarPendingSyncCount();
    
    await cargarDesdeIndexedDB();
    
    if (isOnlineState) {
      sincronizarConAPI();
    }
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    errorState = 'Error al eliminar paciente';
    throw error;
  }
}

async function forzarSincronizacion(): Promise<void> {
  await sincronizarConAPI();
}

async function recargarDatos(): Promise<void> {
  if (isOnlineState) {
    isLoadingState = true;
    try {
      const response = await fetch(`${API_BASE_URL}`);
      
      if (response.ok) {
        const data = await response.json();
        const pacientesDelServidor: PacienteSync[] = data.map((p: PacienteSync) => ({
          ...p,
          synced: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        }));
        
        await clearAllPacientes();
        await bulkSavePacientes(pacientesDelServidor);
      } else {
        await cargarDesdeJSON();
      }
    } catch {
      await cargarDesdeJSON();
    } finally {
      isLoadingState = false;
    }
  } else {
    await cargarDesdeIndexedDB();
  }
  
  await actualizarPendingSyncCount();
}

function inicializarStore(): () => void {
  cargarDesdeIndexedDB();
  
  if (isBrowser) {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  return () => {
    if (isBrowser) {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    }
  };
}

export const pacienteStore = {
  get pacientes() {
    return pacientesState;
  },
  get isOnline() {
    return isOnlineState;
  },
  get pendingSyncCount() {
    return pendingSyncCountState;
  },
  get isLoading() {
    return isLoadingState;
  },
  get error() {
    return errorState;
  },
  
  inicializar: inicializarStore,
  guardar: guardarPacienteLocal,
  actualizar: actualizarPaciente,
  eliminar: eliminarPacienteLocal,
  sincronizar: forzarSincronizacion,
  recargar: recargarDatos,
  refreshCount: actualizarPendingSyncCount,
};
