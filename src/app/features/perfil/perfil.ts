import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../core/services/perfil';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent {
  public perfilService = inject(PerfilService);
  public datos = { ...this.perfilService.perfil() };
  public guardadoExitoso = false;

  guardar(): void {
    this.perfilService.guardarPerfil(this.datos);
    this.guardadoExitoso = true;
    setTimeout(() => this.guardadoExitoso = false, 3000);
  }
}