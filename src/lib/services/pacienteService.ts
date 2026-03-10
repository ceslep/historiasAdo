import type { Paciente } from '../types/paciente';

const API_BASE_URL = 'https://app.iedeoccidente.com/ado';

let pacientesCache: Paciente[] | null = null;

interface PacienteJson {
  paciente: string;
  data: {
    datos: {
      ind: number;
      fecha: string;
      tdei: string;
      identificacion: number;
      nombre1: string;
      nombre2: string;
      apellido1: string;
      apellido2: string;
      adoptado: string;
      nombres: string;
      fecnac: string;
      edad: string;
      lugarnacimiento: string;
      direccion_residencia: string;
      telefono_residencia1: string;
      ciudad_residencia: string;
      telefono_residencia2: string;
      telefono_movil: string;
      beeper: string;
      ocupacion: string;
      estado_civil: string;
      codigo_beeper: string;
      barrio: string;
      direccion_trabajo: string;
      telefono_trabajo: string;
      email1: string;
      email2: string;
      sexo: string;
      historia: number;
    };
  };
}

function normalizarTexto(texto: string | null): string {
  return (texto ?? '').toLowerCase().trim();
}

function mapPaciente(p: PacienteJson): Paciente {
  const datos = p.data.datos;
  return {
    ind: String(datos.ind),
    fecha: datos.fecha || null,
    tdei: datos.tdei || '',
    identificacion: String(datos.identificacion || ''),
    dv: null,
    nombre1: datos.nombre1 || null,
    nombre2: datos.nombre2 || null,
    apellido1: datos.apellido1 || null,
    apellido2: datos.apellido2 || null,
    hobbies: null,
    nombres: datos.nombres || '',
    fecnac: datos.fecnac || null,
    edad: datos.edad || '',
    lugarnacimiento: datos.lugarnacimiento || null,
    direccion_residencia: datos.direccion_residencia || null,
    telefono_residencia1: datos.telefono_residencia1 || null,
    ciudad_residencia: datos.ciudad_residencia || null,
    telefono_residencia2: datos.telefono_residencia2 || null,
    telefono_movil: datos.telefono_movil || null,
    beeper: datos.beeper || null,
    ocupacion: datos.ocupacion || null,
    estado_civil: datos.estado_civil || null,
    codigo_beeper: datos.codigo_beeper || null,
    barrio: datos.barrio || null,
    direccion_trabajo: datos.direccion_trabajo || null,
    telefono_trabajo: datos.telefono_trabajo || null,
    email1: datos.email1 || null,
    email2: datos.email2 || null,
    sexo: datos.sexo || '',
    historia: String(datos.historia || datos.ind),
    hora_registro: null,
    estado: 'ACTIVO',
    tipo: null,
    fecha_inicio: null,
    costo_tratamiento: null,
    retencion: null,
    terminado: null,
    motivo_inactivacion: null,
  };
}

function extraerPacientes(rawData: PacienteJson[]): Paciente[] {
  return rawData
    .filter((item) => item && item.paciente)
    .map((item) => mapPaciente(item));
}

export async function cargarPacientes(): Promise<Paciente[]> {
  if (pacientesCache) {
    return pacientesCache;
  }
  
  const url = `${API_BASE_URL}/paciente.php`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching: ${response.status}`);
    }
    const text = await response.text();
    let rawData: PacienteJson[];
    try {
      rawData = JSON.parse(text) as PacienteJson[];
    } catch {
      // API returns NDJSON (one JSON object per line)
      rawData = text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line) as PacienteJson);
    }
    pacientesCache = extraerPacientes(rawData);
    return pacientesCache;
  } catch (error) {
    console.error('Error loading patients from remote:', error);
    pacientesCache = [];
    return pacientesCache;
  }
}

export async function buscarPacienteRemoto(query: string): Promise<Paciente[]> {
  if (!query.trim()) {
    return [];
  }
  
  const url = `${API_BASE_URL}/buscar.php?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error searching: ${response.status}`);
    }
    const data = await response.json() as { total: number; results: PacienteJson[] };
    
    if (data.results && data.results.length > 0) {
      return data.results.map(mapPaciente);
    }
    return [];
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
}

export function getIniciales(nombre: string | null): string {
  if (!nombre) return '?';
  const partes = nombre.split(' ').filter(p => p.length > 0);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0]?.substring(0, 2).toUpperCase() ?? '?';
}
