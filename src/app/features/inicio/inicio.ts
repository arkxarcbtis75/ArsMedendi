import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicamentoService } from '../../core/services/medicamento.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {
  public medicamentoService = inject(MedicamentoService);

  // Calcula cuántas tomas quedan pendientes para hoy
  get tomasPendientesCount(): number {
    return this.medicamentoService.tomas().filter(t => t.estado === 'pendiente').length;
  }
}