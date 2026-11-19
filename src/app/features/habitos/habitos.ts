import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../core/services/habitos';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habitos.html',
  styleUrl: './habitos.css'
})
export class HabitosComponent implements OnInit {
  public habitosService = inject(HabitosService);

  public aguaInput = 0;
  public suenoInput = 0;
  public ejercicioInput = 0;

  public mostrarEditorBiometrico = signal<boolean>(false);
  public edadTemp = 25;
  public pesoTemp = 70;
  public alturaTemp = 170;
  public generoTemp: 'masculino' | 'femenino' | 'otro' = 'otro';

  public guardadoExitoso = signal<boolean>(false);

  public readonly CIRCUNFERENCIA = 326.73;

  ngOnInit(): void {
    const hoy = this.habitosService.registroHoy();
    this.aguaInput = hoy.aguaMl;
    this.suenoInput = hoy.suenoHoras;
    this.ejercicioInput = hoy.ejercicioMin;

    const perfil = this.habitosService.perfilUsuario();
    this.edadTemp = perfil.edad;
    this.pesoTemp = perfil.peso;
    this.alturaTemp = perfil.altura;
    this.generoTemp = perfil.genero;
  }

  calcularOffsetAnillo(porcentaje: number): number {
    const clamped = Math.min(Math.max(porcentaje, 0), 100);
    return this.CIRCUNFERENCIA - (clamped / 100) * this.CIRCUNFERENCIA;
  }

  guardarHabitos(): void {
    this.habitosService.guardarRegistroHoy({
      aguaMl: Number(this.aguaInput) || 0,
      suenoHoras: Number(this.suenoInput) || 0,
      ejercicioMin: Number(this.ejercicioInput) || 0
    });

    this.guardadoExitoso.set(true);
    setTimeout(() => this.guardadoExitoso.set(false), 2500);
  }

  agregarVasoAgua(): void {
    this.aguaInput = (Number(this.aguaInput) || 0) + 250;
    this.guardarHabitos();
  }

  guardarDatosBiometricos(): void {
    this.habitosService.actualizarDatosBiometricos(
      Number(this.edadTemp) || 25,
      Number(this.pesoTemp) || 70,
      Number(this.alturaTemp) || 170,
      this.generoTemp
    );
    this.mostrarEditorBiometrico.set(false);
  }
}