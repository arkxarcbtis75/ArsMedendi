import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicamentoService } from '../../core/services/medicamento.service';
import { MedicamentoApiService, FdaResultado } from '../../core/services/medicamento-api';

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
  public medicamentoSeleccionadoApi = signal<FdaResultado | null>(null);

  public miFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    dosis: ['', Validators.required],
    frecuenciaHoras: [8, [Validators.required, Validators.min(1)]],
    duracionDias: [7, [Validators.required, Validators.min(1)]],
    instrucciones: ['']
  });

  onBuscarApi(): void {
    const query = this.miFormulario.get('nombre')?.value;
    if (!query || query.length < 3) {
      this.sugerencias.set([]);
      return;
    }

    this.buscandoApi.set(true);
    this.apiService.buscarEnFda(query).subscribe(res => {
      this.sugerencias.set(res);
      this.buscandoApi.set(false);
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

    const apiData = this.medicamentoSeleccionadoApi();

    const nuevoMedicamento = {
      ...this.miFormulario.value,
      fechaInicio: new Date().toISOString().split('T')[0],
      sustanciaActiva: apiData?.sustanciaActiva || 'N/A',
      advertenciaFda: apiData?.advertencias || '',
      viaAdministracion: apiData?.viaAdministracion || 'Oral'
    };

    this.medicamentoService.agregarMedicamento(nuevoMedicamento);

    this.miFormulario.reset({ frecuenciaHoras: 8, duracionDias: 7 });
    this.medicamentoSeleccionadoApi.set(null);
    this.sugerencias.set([]);
  }
}