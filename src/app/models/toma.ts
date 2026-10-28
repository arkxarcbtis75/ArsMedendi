export interface Toma {
  id?: string;
  medicamentoId: string;
  nombreMedicamento: string;
  horaProgramada: string;
  estado: 'pendiente' | 'tomada' | 'omitida';
  horaRealizada?: string;
}