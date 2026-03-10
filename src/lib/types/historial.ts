export interface Cita {
  ind: number;
  horas: string;
  fecha: string;
  paciente: string;
  identificacion: string;
  procedimiento: string;
  consultorio: string;
  vhoras: string;
  asistio: string | null;
  confirmo: string | null;
  conhistoria: string | null;
  motivo: string | null;
  fecha_pide_cita: string | null;
  hora_pide_cita: string | null;
  confirmado_por: string | null;
  hora_llegada: string;
  hora_salida: string;
  proxima_cita: string | null;
  tipo: string | null;
  duracion: number;
  evolucion: string | null;
  borradopor?: string;
  fechaborra?: string;
}

export interface Abono {
  ind: number;
  paciente: number;
  identificacion: string;
  recibo: string;
  valor_abono: number;
  fecha: string;
  hora: string | null;
  forma_de_pago: string | null;
  detalle: string | null;
  facturano: string;
  tipo: string | null;
  tipo_pago: string | null;
  total: number;
}

export interface Saldo {
  paciente: number;
  a: string;
  b: number;
  saldo: number;
  cp: number;
  tipo: string | null;
  no: string;
  ctn: number;
}

export interface Pago {
  ind: number;
  paciente: number;
  tipo: string | null;
  no: string;
  fecha: string | null;
  descripcion: string | null;
  costo_tratamiento: string;
  cuota_inicial1: string;
  nocuotas: string;
  valor_cuota: number;
  cuota_inicial2: string;
  ncuotas: number;
  plan: string | null;
  cancelado: string | null;
  tipest: string;
}

export interface HistorialData {
  paciente: string;
  data: {
    citas: Cita[];
    abonos: Abono[];
    saldos: Saldo[];
    canceladas?: Cita[];
    pagos: Pago[];
  };
}

export interface HistorialResponse {
  total: number;
  results: HistorialData[];
}
