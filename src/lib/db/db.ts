import Dexie, { type Table } from 'dexie';
import type { Cita, Abono, Saldo, Pago } from '../types/historial';

export interface PacienteSync {
  ind: string;
  fecha: string | null;
  tdei: string;
  identificacion: string;
  dv: string | null;
  nombre1: string | null;
  nombre2: string | null;
  apellido1: string | null;
  apellido2: string | null;
  hobbies: string | null;
  nombres: string;
  fecnac: string | null;
  edad: string;
  lugarnacimiento: string | null;
  direccion_residencia: string | null;
  telefono_residencia1: string | null;
  ciudad_residencia: string | null;
  telefono_residencia2: string | null;
  telefono_movil: string | null;
  beeper: string | null;
  ocupacion: string | null;
  estado_civil: string | null;
  codigo_beeper: string | null;
  barrio: string | null;
  direccion_trabajo: string | null;
  telefono_trabajo: string | null;
  email1: string | null;
  email2: string | null;
  sexo: string;
  historia: string;
  hora_registro: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  tipo: string | null;
  fecha_inicio: string | null;
  costo_tratamiento: string | null;
  retencion: string | null;
  terminado: string | null;
  motivo_inactivacion: string | null;
  synced: boolean;
  updatedAt: Date;
  createdAt: Date;
  deleted?: boolean;
}

export interface HistorialCache {
  historia: string;
  citas: Cita[];
  abonos: Abono[];
  saldos: Saldo[];
  pagos: Pago[];
  updatedAt: Date;
}

export class HistoriasDB extends Dexie {
  pacientes!: Table<PacienteSync, string>;
  historial!: Table<HistorialCache, string>;

  constructor() {
    super('HistoriasDB');
    this.version(1).stores({
      pacientes: 'ind, synced, updatedAt, estado',
    });
    this.version(2).stores({
      pacientes: 'ind, synced, updatedAt, estado, identificacion, historia, nombres',
    });
    this.version(3).stores({
      pacientes: 'ind, synced, updatedAt, estado, identificacion, historia, nombres',
      historial: 'historia, updatedAt',
    });
  }
}

export const db = new HistoriasDB();

export async function getAllPacientes(): Promise<PacienteSync[]> {
  return db.pacientes.toArray();
}

export async function getPacienteById(ind: string): Promise<PacienteSync | undefined> {
  return db.pacientes.get(ind);
}

export async function savePaciente(
  paciente: Omit<PacienteSync, 'synced' | 'updatedAt' | 'createdAt' | 'deleted'> & { synced?: boolean }
): Promise<string> {
  const now = new Date();
  const pacienteToSave: PacienteSync = {
    ...paciente,
    synced: paciente.synced ?? false,
    updatedAt: now,
    createdAt: now,
  };

  await db.pacientes.put(pacienteToSave);
  return paciente.ind;
}

export async function updatePaciente(ind: string, changes: Partial<PacienteSync>): Promise<void> {
  const updateObj: Record<string, unknown> = {
    updatedAt: new Date(),
    synced: false,
  };
  
  for (const [key, value] of Object.entries(changes)) {
    if (key !== 'ind' && key !== 'createdAt') {
      updateObj[key] = value;
    }
  }
  
  await db.pacientes.update(ind, updateObj);
}

export async function deletePaciente(ind: string): Promise<void> {
  await db.pacientes.update(ind, {
    deleted: true,
    updatedAt: new Date(),
    synced: false,
  });
}

export async function getUnsyncedPacientes(): Promise<PacienteSync[]> {
  return db.pacientes
    .filter((p) => !p.synced)
    .toArray();
}

export async function markAsSynced(inds: string[]): Promise<void> {
  await db.pacientes.where('ind').anyOf(inds).modify({
    synced: true,
  });
}

export async function clearAllPacientes(): Promise<void> {
  await db.pacientes.clear();
}

export async function bulkSavePacientes(pacientes: PacienteSync[]): Promise<void> {
  await db.pacientes.bulkPut(pacientes);
}

export async function getPacientesCount(): Promise<number> {
  return db.pacientes.count();
}

export async function getUnsyncedCount(): Promise<number> {
  return db.pacientes.filter((p) => !p.synced).count();
}

export async function getDeletedCount(): Promise<number> {
  return db.pacientes.filter((p) => p.deleted).count();
}

export interface DBStats {
  total: number;
  synced: number;
  pending: number;
  deleted: number;
}

export async function getDBStats(): Promise<DBStats> {
  const [total, synced, pending, deleted] = await Promise.all([
    db.pacientes.count(),
    db.pacientes.filter((p) => p.synced && !p.deleted).count(),
    db.pacientes.filter((p) => !p.synced && !p.deleted).count(),
    db.pacientes.filter((p) => p.deleted).count(),
  ]);
  return { total, synced, pending, deleted };
}

export async function buscarPacientesLocal(query: string, maxResults = 50): Promise<PacienteSync[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const allPacientes = await db.pacientes
    .filter((p) => !p.deleted)
    .toArray();

  const results: PacienteSync[] = [];
  const qLower = q.toLowerCase();
  const hasWildcards = q.includes('*') || q.includes('?');
  
  let qWithWildcard: string;
  if (hasWildcards) {
    qWithWildcard = '*' + q.replace(/\s+/g, '*') + '*';
  } else {
    qWithWildcard = '*' + q + '*';
  }

  function globToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp('^' + regexPattern + '$', 'i');
  }

  function matchWithWildcard(text: string, pattern: string): boolean {
    const regex = globToRegex(pattern);
    return regex.test(text);
  }

  for (const paciente of allPacientes) {
    if (results.length >= maxResults) break;

    const historia = String(paciente.historia || '');
    const ind = String(paciente.ind || '');
    const identificacion = String(paciente.identificacion || '');
    const nombres = (paciente.nombres || '').toLowerCase();

    let match = false;

    if (q === historia || q === ind) {
      match = true;
    } else if (matchWithWildcard(identificacion, qWithWildcard)) {
      match = true;
    } else if (matchWithWildcard(nombres, qWithWildcard)) {
      match = true;
    }

    if (match) {
      results.push(paciente);
    }
  }

  return results;
}

// ========== Historial Cache ==========

export async function getHistorialCache(historia: string): Promise<HistorialCache | undefined> {
  return db.historial.get(historia);
}

export async function saveHistorialCache(cache: HistorialCache): Promise<void> {
  await db.historial.put(cache);
}

export async function clearHistorialCache(): Promise<void> {
  await db.historial.clear();
}

export async function getHistorialCacheCount(): Promise<number> {
  return db.historial.count();
}
