import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmaciaService } from '../../core/services/farmacia';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent {
  public farmaciaService = inject(FarmaciaService);
  
  public farmaciaSel = '';
  public medicamentoNom = '';
  public estaDisponible = true;

  reportar(): void {
    if (!this.farmaciaSel || !this.medicamentoNom) return;
    this.farmaciaService.agregarReporte({
      farmaciaNombre: this.farmaciaSel,
      medicamentoNombre: this.medicamentoNom,
      disponible: this.estaDisponible,
      fechaReporte: ''
    });
    this.medicamentoNom = '';
  }
}