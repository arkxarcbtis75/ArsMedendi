export interface Farmacia {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  esAutorizadaControlados: boolean;
}

export interface ReporteDisponibilidad {
  id?: string;
  farmaciaNombre: string;
  medicamentoNombre: string;
  disponible: boolean;
  fechaReporte: string;
}