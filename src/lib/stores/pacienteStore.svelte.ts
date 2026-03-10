const isBrowser = typeof window !== 'undefined';
import { buscarPacienteRemoto, cargarPacientes } from '../services/pacienteService';
import { 
  buscarPacientesLocal, 
  bulkSavePacientes, 
  getPacientesCount,
  clearAllPacientes,
  type PacienteSync 
} from '../db/db';
import type { Paciente } from '../types/paciente';

let pacientesState = $state<Paciente[]>([]);
let isOnlineState = $state(isBrowser ? navigator.onLine : true);
let isLoadingState = $state(false);
let isSearchingOnlineState = $state(true);
let isSyncingState = $state(false);
let errorState = $state<string | null>(null);

function updateOnlineStatus() {
  isOnlineState = isBrowser ? navigator.onLine : true;
}

function mapPacienteToSync(paciente: Paciente): PacienteSync {
  return {
    ind: paciente.ind,
    fecha: paciente.fecha,
    tdei: paciente.tdei,
    identificacion: paciente.identificacion,
    dv: paciente.dv,
    nombre1: paciente.nombre1,
    nombre2: paciente.nombre2,
    apellido1: paciente.apellido1,
    apellido2: paciente.apellido2,
    hobbies: paciente.hobbies,
    nombres: paciente.nombres,
    fecnac: paciente.fecnac,
    edad: paciente.edad,
    lugarnacimiento: paciente.lugarnacimiento,
    direccion_residencia: paciente.direccion_residencia,
    telefono_residencia1: paciente.telefono_residencia1,
    ciudad_residencia: paciente.ciudad_residencia,
    telefono_residencia2: paciente.telefono_residencia2,
    telefono_movil: paciente.telefono_movil,
    beeper: paciente.beeper,
    ocupacion: paciente.ocupacion,
    estado_civil: paciente.estado_civil,
    codigo_beeper: paciente.codigo_beeper,
    barrio: paciente.barrio,
    direccion_trabajo: paciente.direccion_trabajo,
    telefono_trabajo: paciente.telefono_trabajo,
    email1: paciente.email1,
    email2: paciente.email2,
    sexo: paciente.sexo,
    historia: paciente.historia,
    hora_registro: paciente.hora_registro,
    estado: paciente.estado || 'ACTIVO',
    tipo: paciente.tipo,
    fecha_inicio: paciente.fecha_inicio,
    costo_tratamiento: paciente.costo_tratamiento,
    retencion: paciente.retencion,
    terminado: paciente.terminado,
    motivo_inactivacion: paciente.motivo_inactivacion,
    synced: true,
    updatedAt: new Date(),
    createdAt: new Date(),
  };
}

async function sincronizarDatosLocales(): Promise<void> {
  if (!isBrowser || !navigator.onLine) return;
  
  try {
    isSyncingState = true;
    
    const localCount = await getPacientesCount();
    
    if (localCount === 0) {
      console.log('Sincronizando pacientes con IndexedDB...');
      const todosPacientes = await cargarPacientes();
      
      if (todosPacientes.length > 0) {
        const pacientesSync = todosPacientes.map(mapPacienteToSync);
        await bulkSavePacientes(pacientesSync);
        console.log(`Sincronizados ${todosPacientes.length} pacientes a IndexedDB`);
      }
    } else {
      console.log(`IndexedDB ya tiene ${localCount} pacientes`);
    }
  } catch (error) {
    console.error('Error sincronizando datos locales:', error);
  } finally {
    isSyncingState = false;
  }
}

async function buscarPacientes(query: string): Promise<Paciente[]> {
  if (!query.trim()) {
    return [];
  }
  
  try {
    isLoadingState = true;
    
    if (isOnlineState) {
      isSearchingOnlineState = true;
      return await buscarPacienteRemoto(query);
    } else {
      isSearchingOnlineState = false;
      const localResults = await buscarPacientesLocal(query);
      return localResults.map((p) => ({
        ind: p.ind,
        fecha: p.fecha,
        tdei: p.tdei,
        identificacion: p.identificacion,
        dv: p.dv,
        nombre1: p.nombre1,
        nombre2: p.nombre2,
        apellido1: p.apellido1,
        apellido2: p.apellido2,
        hobbies: p.hobbies,
        nombres: p.nombres,
        fecnac: p.fecnac,
        edad: p.edad,
        lugarnacimiento: p.lugarnacimiento,
        direccion_residencia: p.direccion_residencia,
        telefono_residencia1: p.telefono_residencia1,
        ciudad_residencia: p.ciudad_residencia,
        telefono_residencia2: p.telefono_residencia2,
        telefono_movil: p.telefono_movil,
        beeper: p.beeper,
        ocupacion: p.ocupacion,
        estado_civil: p.estado_civil,
        codigo_beeper: p.codigo_beeper,
        barrio: p.barrio,
        direccion_trabajo: p.direccion_trabajo,
        telefono_trabajo: p.telefono_trabajo,
        email1: p.email1,
        email2: p.email2,
        sexo: p.sexo,
        historia: p.historia,
        hora_registro: p.hora_registro,
        estado: p.estado,
        tipo: p.tipo,
        fecha_inicio: p.fecha_inicio,
        costo_tratamiento: p.costo_tratamiento,
        retencion: p.retencion,
        terminado: p.terminado,
        motivo_inactivacion: p.motivo_inactivacion,
      }));
    }
  } catch (error) {
    console.error('Error al buscar pacientes:', error);
    return [];
  } finally {
    isLoadingState = false;
  }
}

async function recargarDatos(): Promise<void> {
  pacientesState = [];
}

function inicializarStore(): () => void {
  if (isBrowser) {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    sincronizarDatosLocales();
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
  get isLoading() {
    return isLoadingState;
  },
  get isSearchingOnline() {
    return isSearchingOnlineState;
  },
  get isSyncing() {
    return isSyncingState;
  },
  get error() {
    return errorState;
  },
  
  inicializar: inicializarStore,
  buscar: buscarPacientes,
  recargar: recargarDatos,
  sincronizar: sincronizarDatosLocales,
};
