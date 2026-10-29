import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css'
})
export class BuscadorComponent {
  public termino = '';
  public resultadoSimulado: any = null;

  buscarInfo(): void {
    if (!this.termino.trim()) return;

    this.resultadoSimulado = {
      nombre: this.termino.toUpperCase(),
      tipo: 'Medicamento / Sustancia Activa',
      advertencias: 'No exceder la dosis recomendada. Consulte a su médico en caso de embarazo o lactancia.',
      interacciones: 'Evitar el consumo simultáneo con bebidas alcohólicas.',
      fuente: 'Consulta oficial simulada (openFDA / COFEPRIS)'
    };
  }
}