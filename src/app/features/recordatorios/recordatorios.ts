import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicamentoService } from '../../core/services/medicamento.service';

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recordatorios.html',
  styleUrl: './recordatorios.css'
})
export class RecordatoriosComponent {
  public medicamentoService = inject(MedicamentoService);

  marcarToma(id: string | undefined, estado: 'tomada' | 'omitida'): void {
    if (id) {
      this.medicamentoService.cambiarEstadoToma(id, estado);
    }
  }
}