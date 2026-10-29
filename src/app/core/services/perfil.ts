import { Injectable, signal } from '@angular/core';
import { PerfilUsuario } from '../../models/perfil';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private perfilSignal = signal<PerfilUsuario>(this.cargarPerfil());
  public perfil = this.perfilSignal.asReadonly();

  guardarPerfil(datos: PerfilUsuario): void {
    this.perfilSignal.set(datos);
    localStorage.setItem('ars_perfil', JSON.stringify(datos));
  }

  private cargarPerfil(): PerfilUsuario {
    const datos = localStorage.getItem('ars_perfil');
    return datos ? JSON.parse(datos) : { nombre: '', alergias: '', contactoNombre: '', contactoTelefono: '' };
  }
}