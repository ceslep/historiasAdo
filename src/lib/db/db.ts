import Dexie, { type Table } from 'dexie';

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

export class HistoriasDB extends Dexie {
  pacientes!: Table<PacienteSync, string>;

  constructor() {
    super('HistoriasDB');
    this.version(1).stores({
      pacientes: 'ind, synced, updatedAt, estado',
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
