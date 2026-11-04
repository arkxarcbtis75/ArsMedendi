export interface Medicamento {
  id?: string;
  nombre: string;
  dosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
  fechaInicio: string;
  instrucciones?: string;
  sustanciaActiva?: string;
  advertenciaFda?: string;
  viaAdministracion?: string;
}