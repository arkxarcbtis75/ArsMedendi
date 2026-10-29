import { Injectable, signal } from '@angular/core';
import { HabitoDiario } from '../../models/habito';

@Injectable({ providedIn: 'root' })
export class HabitoService {
  private habitoHoySignal = signal<HabitoDiario>(this.obtenerOInicializar());
  public habitoHoy = this.habitoHoySignal.asReadonly();

  actualizarAgua(delta: number): void {
    this.habitoHoySignal.update(h => ({
      ...h,
      vasosAgua: Math.max(0, h.vasosAgua + delta)
    }));
    this.guardar();
  }

  actualizarSueno(horas: number): void {
    this.habitoHoySignal.update(h => ({ ...h, horasSueno: horas }));
    this.guardar();
  }

  actualizarEjercicio(minutos: number): void {
    this.habitoHoySignal.update(h => ({ ...h, minutosEjercicio: minutos }));
    this.guardar();
  }

  private guardar(): void {
    localStorage.setItem('ars_habitos_hoy', JSON.stringify(this.habitoHoySignal()));
  }

  private obtenerOInicializar(): HabitoDiario {
    const datos = localStorage.getItem('ars_habitos_hoy');
    const hoy = new Date().toISOString().split('T')[0];
    if (datos) {
      const parsed = JSON.parse(datos);
      if (parsed.fecha === hoy) return parsed;
    }
    return { fecha: hoy, vasosAgua: 0, horasSueno: 7, minutosEjercicio: 0 };
  }
}