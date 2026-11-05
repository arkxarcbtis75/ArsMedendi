import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicamentoApiService, FdaResultado } from '../../core/services/medicamento-api';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css'
})
export class BuscadorComponent {
  private apiService = inject(MedicamentoApiService);

  public termino = '';
  public cargando = signal<boolean>(false);
  public resultados = signal<FdaResultado[]>([]);
  public realizoBusqueda = signal<boolean>(false);

  buscarInfo(): void {
    const query = this.termino.trim();
    if (!query) return;

    this.cargando.set(true);
    this.realizoBusqueda.set(true);
    this.resultados.set([]);

    this.apiService.buscarEnFda(query).subscribe({
      next: (res) => {
        this.resultados.set(res);
        this.cargando.set(false);
      },
      error: () => {
        this.resultados.set([]);
        this.cargando.set(false);
      }
    });
  }
}