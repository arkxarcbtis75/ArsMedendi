import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicamentoService } from '../../core/services/medicamento.service';
import { MedicamentoApiService, FdaResultado } from '../../core/services/medicamento-api';
import { of } from 'rxjs';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicamentos.html',
  styleUrl: './medicamentos.css'
})
export class MedicamentosComponent {
  private fb = inject(FormBuilder);
  public medicamentoService = inject(MedicamentoService);
  private apiService = inject(MedicamentoApiService);

  public sugerencias = signal<FdaResultado[]>([]);
  public buscandoApi = signal<boolean>(false);
  public guardando = signal<boolean>(false);
  public medicamentoSeleccionadoApi = signal<FdaResultado | null>(null);

  public miFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    dosis: ['', Validators.required],
    frecuenciaHoras: [8, [Validators.required, Validators.min(1)]],
    duracionDias: [7, [Validators.required, Validators.min(1)]],
    instrucciones: ['']
  });

  onBuscarApi(): void {
    // Si modifica el texto manualmente, desmarcamos la selección previa
    this.medicamentoSeleccionadoApi.set(null);

    const query = this.miFormulario.get('nombre')?.value;
    if (!query || query.trim().length < 2) {
      this.sugerencias.set([]);
      return;
    }

    this.buscandoApi.set(true);
    this.apiService.buscarEnFda(query).subscribe({
      next: (res) => {
        this.sugerencias.set(res);
        this.buscandoApi.set(false);
      },
      error: () => {
        this.sugerencias.set([]);
        this.buscandoApi.set(false);
      }
    });
  }

  seleccionarSugerencia(item: FdaResultado): void {
    this.miFormulario.patchValue({
      nombre: item.nombre
    });
    this.medicamentoSeleccionadoApi.set(item);
    this.sugerencias.set([]);
  }

  guardarMedicamento(): void {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const nombreInput = this.miFormulario.get('nombre')?.value;
    const apiData = this.medicamentoSeleccionadoApi();

    const obtenerDatosApi$ = apiData 
      ? of([apiData]) 
      : this.apiService.buscarEnFda(nombreInput);

    obtenerDatosApi$.subscribe({
      next: (resultados) => {
        const infoFda = resultados.length > 0 ? resultados[0] : null;

        const nuevoMedicamento = {
          ...this.miFormulario.value,
          fechaInicio: new Date().toISOString().split('T')[0],
          sustanciaActiva: infoFda?.sustanciaActiva || 'N/A',
          advertenciaFda: infoFda?.advertencias || 'Sin advertencias específicas registradas.',
          viaAdministracion: infoFda?.viaAdministracion || 'Oral'
        };

        this.medicamentoService.agregarMedicamento(nuevoMedicamento);

        this.miFormulario.reset({ frecuenciaHoras: 8, duracionDias: 7 });
        this.medicamentoSeleccionadoApi.set(null);
        this.sugerencias.set([]);
        this.guardando.set(false);
      },
      error: () => {
        const nuevoMedicamento = {
          ...this.miFormulario.value,
          fechaInicio: new Date().toISOString().split('T')[0],
          sustanciaActiva: 'N/A',
          advertenciaFda: 'Sin advertencias específicas registradas.',
          viaAdministracion: 'Oral'
        };
        this.medicamentoService.agregarMedicamento(nuevoMedicamento);
        this.miFormulario.reset({ frecuenciaHoras: 8, duracionDias: 7 });
        this.medicamentoSeleccionadoApi.set(null);
        this.sugerencias.set([]);
        this.guardando.set(false);
      }
    });
  }
}