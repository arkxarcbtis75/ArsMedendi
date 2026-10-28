import { Injectable, signal } from '@angular/core';
import { Medicamento } from "../../models/medicamento";

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  // Inicializa la señal con los datos guardados en localStorage (si existen)
  private medicamentosSignal = signal<Medicamento[]>(this.obtenerDeLocalStorage());
  public medicamentos = this.medicamentosSignal.asReadonly();

  agregarMedicamento(nuevo: Medicamento): void {
    const medicamentoConId = { ...nuevo, id: crypto.randomUUID() };
    this.medicamentosSignal.update(lista => [...lista, medicamentoConId]);
    this.guardarEnLocalStorage();
  }

  obtenerMedicamentos(): Medicamento[] {
    return this.medicamentosSignal();
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('ars_medicamentos', JSON.stringify(this.medicamentosSignal()));
  }

  private obtenerDeLocalStorage(): Medicamento[] {
    const datos = localStorage.getItem('ars_medicamentos');
    return datos ? JSON.parse(datos) : [];
  }
}