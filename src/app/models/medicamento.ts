export interface Medicamento {
  id?: string;
  nombre: string;
  dosis: string;
  frecuenciaHoras: number;
  fechaInicio: string;
  fechaFin?: string;
  duracionDias: number;
  instrucciones?: string;
}