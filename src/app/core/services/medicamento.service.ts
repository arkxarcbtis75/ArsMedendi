import { Injectable, signal } from '@angular/core';
import { Medicamento } from '../../models/medicamento';
import { Toma } from '../../models/toma';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  private medicamentosSignal = signal<Medicamento[]>(this.obtenerDeLocalStorage('ars_medicamentos'));
  public medicamentos = this.medicamentosSignal.asReadonly();

  private tomasSignal = signal<Toma[]>(this.obtenerDeLocalStorage('ars_tomas'));
  public tomas = this.tomasSignal.asReadonly();

  agregarMedicamento(nuevo: Medicamento): void {
    const medicamentoConId = { ...nuevo, id: crypto.randomUUID() };
    this.medicamentosSignal.update(lista => [...lista, medicamentoConId]);
    this.guardarEnLocalStorage('ars_medicamentos', this.medicamentosSignal());
    
    this.generarTomasParaHoy(medicamentoConId);
  }

  cambiarEstadoToma(tomaId: string, nuevoEstado: 'tomada' | 'omitida'): void {
    this.tomasSignal.update(lista =>
      lista.map(toma =>
        toma.id === tomaId
          ? { ...toma, estado: nuevoEstado, horaRealizada: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : toma
      )
    );
    this.guardarEnLocalStorage('ars_tomas', this.tomasSignal());
  }

  private generarTomasParaHoy(med: Medicamento): void {
    const hoy = new Date().toISOString().split('T')[0];
    const tomasNuevas: Toma[] = [];
    const tomasPorDia = Math.floor(24 / med.frecuenciaHoras);

    for (let i = 0; i < tomasPorDia; i++) {
      const horaEfectiva = i * med.frecuenciaHoras;
      const horaFormateada = `${horaEfectiva.toString().padStart(2, '0')}:00`;

      tomasNuevas.push({
        id: crypto.randomUUID(),
        medicamentoId: med.id!,
        nombreMedicamento: med.nombre,
        horaProgramada: horaFormateada,
        estado: 'pendiente'
      });
    }

    this.tomasSignal.update(lista => [...lista, ...tomasNuevas]);
    this.guardarEnLocalStorage('ars_tomas', this.tomasSignal());
  }

  private guardarEnLocalStorage(clave: string, datos: any): void {
    localStorage.setItem(clave, JSON.stringify(datos));
  }

  private obtenerDeLocalStorage(clave: string): any[] {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : [];
  }
}