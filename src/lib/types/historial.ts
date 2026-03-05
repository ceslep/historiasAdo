export interface Cita {
  ind: string;
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
  duracion: string;
  evolucion: string | null;
  borradopor?: string;
  fechaborra?: string;
}

export interface Abono {
  ind: string;
  paciente: string;
  identificacion: string;
  recibo: string;
  valor_abono: string;
  fecha: string;
  hora: string | null;
  forma_de_pago: string | null;
  detalle: string | null;
  facturano: string;
  tipo: string | null;
  tipo_pago: string | null;
  total: string;
}

export interface Saldo {
  paciente: string;
  a: string;
  b: string;
  saldo: string;
  cp: string;
  tipo: string | null;
  no: string;
  ctn: string;
}

export interface Pago {
  ind: string;
  paciente: string;
  tipo: string | null;
  no: string;
  fecha: string | null;
  descripcion: string | null;
  costo_tratamiento: string;
  cuota_inicial1: string;
  nocuotas: string;
  valor_cuota: string;
  cuota_inicial2: string;
  ncuotas: string;
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
