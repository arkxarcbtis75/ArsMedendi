import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicamentoService } from '../../core/services/medicamento.service';

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

  public miFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    dosis: ['', Validators.required],
    frecuenciaHoras: [8, [Validators.required, Validators.min(1)]],
    duracionDias: [7, [Validators.required, Validators.min(1)]],
    instrucciones: ['']
  });

  guardarMedicamento(): void {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      return;
    }

    const nuevoMedicamento = {
      ...this.miFormulario.value,
      fechaInicio: new Date().toISOString().split('T')[0]
    };

    this.medicamentoService.agregarMedicamento(nuevoMedicamento);

    this.miFormulario.reset({
      frecuenciaHoras: 8,
      duracionDias: 7
    });
  }
}