import type { Paciente } from '../types/paciente';
import pacienteData from '../../assets/paciente.json';

let pacientesCache: Paciente[] | null = null;

function normalizarTexto(texto: string | null): string {
  return (texto ?? '').toLowerCase().trim();
}

function mapPaciente(p: Record<string, unknown>): Paciente {
  return {
    ind: String(p.ind ?? ''),
    fecha: p.fecha as string | null,
    tdei: String(p.tdei ?? ''),
    identificacion: String(p.identificacion ?? ''),
    dv: p.dv as string | null,
    nombre1: p.nombre1 as string | null,
    nombre2: p.nombre2 as string | null,
    apellido1: p.apellido1 as string | null,
    apellido2: p.apellido2 as string | null,
    hobbies: p.hobbies as string | null,
    nombres: String(p.nombres ?? ''),
    fecnac: p.fecnac as string | null,
    edad: String(p.edad ?? ''),
    lugarnacimiento: p.lugarnacimiento as string | null,
    direccion_residencia: p.direccion_residencia as string | null,
    telefono_residencia1: p.telefono_residencia1 as string | null,
    ciudad_residencia: p.ciudad_residencia as string | null,
    telefono_residencia2: p.telefono_residencia2 as string | null,
    telefono_movil: p.telefono_movil as string | null,
    beeper: p.beeper as string | null,
    ocupacion: p.ocupacion as string | null,
    estado_civil: p.estado_civil as string | null,
    codigo_beeper: p.codigo_beeper as string | null,
    barrio: p.barrio as string | null,
    direccion_trabajo: p.direccion_trabajo as string | null,
    telefono_trabajo: p.telefono_trabajo as string | null,
    email1: p.email1 as string | null,
    email2: p.email2 as string | null,
    sexo: String(p.sexo ?? ''),
    historia: String(p.historia ?? ''),
    hora_registro: p.hora_registro as string | null,
    estado: String(p.estado ?? '').toUpperCase() === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO',
    tipo: p.tipo as string | null,
    fecha_inicio: p.fecha_inicio as string | null,
    costo_tratamiento: p.costo_tratamiento as string | null,
    retencion: p.retencion as string | null,
    terminado: p.terminado as string | null,
    motivo_inactivacion: p.motivo_inactivacion as string | null,
  };
}

function extraerPacientes(rawData: unknown[]): Paciente[] {
  const firstItem = rawData[0] as Record<string, unknown> | undefined;
  
  if (!firstItem || !('type' in firstItem)) {
    return rawData
      .filter((item) => item && typeof item === 'object')
      .map((item) => mapPaciente(item as Record<string, unknown>));
  }

  const pacientes: Paciente[] = [];
  
  for (const item of rawData) {
    if (item && typeof item === 'object' && 'type' in item) {
      const obj = item as { type: string; data?: unknown[] };
      if (obj.type === 'table' && Array.isArray(obj.data)) {
        for (const paciente of obj.data) {
          if (paciente && typeof paciente === 'object') {
            pacientes.push(mapPaciente(paciente as Record<string, unknown>));
          }
        }
      }
    }
  }
  
  return pacientes;
}

export async function cargarPacientes(): Promise<Paciente[]> {
  if (pacientesCache) {
    return pacientesCache;
  }
  
  pacientesCache = extraerPacientes(pacienteData as unknown[]);
  return pacientesCache;
}

export function buscarPacientes(
  pacientes: Paciente[],
  query: string,
  estadoFiltro: 'todos' | 'ACTIVO' | 'INACTIVO' = 'todos'
): Paciente[] {
  const queryNormalizada = normalizarTexto(query);
  
  return pacientes.filter((paciente) => {
    if (estadoFiltro !== 'todos' && paciente.estado !== estadoFiltro) {
      return false;
    }
    
    if (queryNormalizada.length < 3) {
      return false;
    }
    
    const camposBusqueda = [
      paciente.nombres,
      paciente.nombre1,
      paciente.apellido1,
      paciente.identificacion,
      paciente.historia,
      paciente.telefono_movil,
      paciente.telefono_residencia1,
      paciente.email1,
    ];
    
    return camposBusqueda.some((campo) => 
      normalizarTexto(campo).includes(queryNormalizada)
    );
  });
}

export function getIniciales(nombre: string | null): string {
  if (!nombre) return '?';
  const partes = nombre.split(' ').filter(p => p.length > 0);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0]?.substring(0, 2).toUpperCase() ?? '?';
}
