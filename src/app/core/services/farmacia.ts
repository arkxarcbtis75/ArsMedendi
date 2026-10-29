import { Injectable, signal } from '@angular/core';
import { Farmacia, ReporteDisponibilidad } from '../../models/farmacia';

@Injectable({ providedIn: 'root' })
export class FarmaciaService {
  public farmacias = signal<Farmacia[]>([
    { id: '1', nombre: 'Farmacia Centro', direccion: 'Calle Principal #123', telefono: '4181234567', esAutorizadaControlados: true },
    { id: '2', nombre: 'Farmacia San José', direccion: 'Av. Hidalgo #45', telefono: '4187654321', esAutorizadaControlados: false }
  ]);

  private reportesSignal = signal<ReporteDisponibilidad[]>(this.cargarReportes());
  public reportes = this.reportesSignal.asReadonly();

  agregarReporte(nuevo: ReporteDisponibilidad): void {
    const reporteConFecha = {
      ...nuevo,
      id: crypto.randomUUID(),
      fechaReporte: new Date().toLocaleString()
    };
    this.reportesSignal.update(r => [reporteConFecha, ...r]);
    localStorage.setItem('ars_reportes_farmacia', JSON.stringify(this.reportesSignal()));
  }

  private cargarReportes(): ReporteDisponibilidad[] {
    const datos = localStorage.getItem('ars_reportes_farmacia');
    return datos ? JSON.parse(datos) : [];
  }
}