export interface Paciente {
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
}

export interface CampoSeleccionable {
  key: string;
  label: string;
  categoria: 'identificacion' | 'personal' | 'contacto' | 'tratamiento' | 'otros';
  seleccionado: boolean;
}

export interface Campo {
  key: string;
  label: string;
  categoria: 'identificacion' | 'personal' | 'contacto' | 'tratamiento' | 'otros';
}

export const CAMPOS_POR_DEFECTO: Campo[] = [
  { key: 'ind', label: 'ID Interno', categoria: 'identificacion' },
  { key: 'historia', label: 'Historia', categoria: 'identificacion' },
  { key: 'identificacion', label: 'Identificación', categoria: 'identificacion' },
  { key: 'tdei', label: 'Tipo ID', categoria: 'identificacion' },
  { key: 'nombres', label: 'Nombres Completos', categoria: 'personal' },
  { key: 'nombre1', label: 'Primer Nombre', categoria: 'personal' },
  { key: 'apellido1', label: 'Primer Apellido', categoria: 'personal' },
  { key: 'fecnac', label: 'Fecha Nacimiento', categoria: 'personal' },
  { key: 'edad', label: 'Edad', categoria: 'personal' },
  { key: 'sexo', label: 'Sexo', categoria: 'personal' },
  { key: 'telefono_movil', label: 'Celular', categoria: 'contacto' },
  { key: 'telefono_residencia1', label: 'Teléfono Residencia', categoria: 'contacto' },
  { key: 'email1', label: 'Email', categoria: 'contacto' },
  { key: 'direccion_residencia', label: 'Dirección', categoria: 'contacto' },
  { key: 'ciudad_residencia', label: 'Ciudad', categoria: 'contacto' },
  { key: 'estado', label: 'Estado', categoria: 'tratamiento' },
  { key: 'tipo', label: 'Tipo Tratamiento', categoria: 'tratamiento' },
  { key: 'fecha_inicio', label: 'Fecha Inicio', categoria: 'tratamiento' },
  { key: 'costo_tratamiento', label: 'Costo', categoria: 'tratamiento' },
  { key: 'retencion', label: 'Retención', categoria: 'tratamiento' },
  { key: 'terminado', label: 'Terminado', categoria: 'tratamiento' },
];
