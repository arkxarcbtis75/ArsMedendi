import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../core/services/habitos';
import { FirebaseService } from '../../core/services/firebase';

export interface PerfilClinicoCompleto {
  nombre: string;
  edad: number;
  peso: number;
  altura: number;
  genero: 'masculino' | 'femenino' | 'otro';
  tipoSangre: string;
  alergias: string;
  condicionesMedicas: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  completado: boolean;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit {
  public habitosService = inject(HabitosService);
  public firebaseService = inject(FirebaseService);
  private readonly STORAGE_PERFIL = 'ars_medendi_perfil';

  public guardadoExitoso = signal<boolean>(false);
  public modoRegistro = signal<boolean>(false);
  public correoAuth = '';
  public passwordAuth = '';
  public errorAuth = signal<string>('');

  public perfil: PerfilClinicoCompleto = {
    nombre: '',
    edad: 25,
    peso: 70,
    altura: 170,
    genero: 'otro',
    tipoSangre: 'No especificado',
    alergias: '',
    condicionesMedicas: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    completado: false
  };

  constructor() {
    // Actualiza el formulario automáticamente en cuanto Firebase sincroniza datos desde la nube
    effect(() => {
      const respaldo = this.firebaseService.ultimoRespaldo();
      if (respaldo) {
        this.cargarPerfilCompleto();
      }
    });
  }

  ngOnInit(): void {
    this.cargarPerfilCompleto();
  }

  private cargarPerfilCompleto(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_PERFIL);
      if (raw) {
        const data = JSON.parse(raw);
        this.perfil = {
          nombre: data.nombre || '',
          edad: Number(data.edad) || 25,
          peso: Number(data.peso) || 70,
          altura: Number(data.altura) || 170,
          genero: data.genero || 'otro',
          tipoSangre: data.tipoSangre || 'No especificado',
          alergias: data.alergias || '',
          condicionesMedicas: data.condicionesMedicas || '',
          contactoEmergenciaNombre: data.contactoEmergenciaNombre || '',
          contactoEmergenciaTelefono: data.contactoEmergenciaTelefono || '',
          completado: Boolean(data.completado)
        };
      }
    } catch {}
  }

  async guardarPerfil(): Promise<void> {
    const edadNum = Math.max(1, Number(this.perfil.edad) || 25);
    const pesoNum = Math.max(20, Number(this.perfil.peso) || 70);
    const alturaNum = Math.max(80, Number(this.perfil.altura) || 170);

    this.perfil = {
      ...this.perfil,
      edad: edadNum,
      peso: pesoNum,
      altura: alturaNum,
      completado: true
    };

    // 1. Actualiza los Signals de HabitosService (recalcula IMC y metas diarias)
    this.habitosService.actualizarDatosBiometricos(
      edadNum,
      pesoNum,
      alturaNum,
      this.perfil.genero
    );

    // 2. Guarda localmente y respalda en Firestore si hay sesión activa
    localStorage.setItem(this.STORAGE_PERFIL, JSON.stringify(this.perfil));
    await this.firebaseService.subirDatosANube();

    this.guardadoExitoso.set(true);
    setTimeout(() => this.guardadoExitoso.set(false), 3000);
  }

  async autenticarCorreo(): Promise<void> {
    this.errorAuth.set('');
    try {
      if (this.modoRegistro()) {
        await this.firebaseService.registrarConCorreo(this.correoAuth, this.passwordAuth);
      } else {
        await this.firebaseService.iniciarSesionCorreo(this.correoAuth, this.passwordAuth);
      }
      this.correoAuth = '';
      this.passwordAuth = '';
    } catch {
      this.errorAuth.set('Verifica tu correo y contraseña (mínimo 6 caracteres).');
    }
  }

  async accederConGoogle(): Promise<void> {
    this.errorAuth.set('');
    try {
      await this.firebaseService.iniciarSesionGoogle();
    } catch {
      this.errorAuth.set('No se pudo completar el acceso con Google.');
    }
  }
}