import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);

  public busquedaActual = signal<string>('Farmacias');
  public textoBuscador = '';
  public mapaUrl = signal<SafeResourceUrl | null>(null);
  public coordenadas = signal<{ lat: number; lng: number } | null>(null);
  public estadoUbicacion = signal<'detectando' | 'activa' | 'denegada'>('detectando');

  ngOnInit(): void {
    // Carga inicial inmediata mientras se solicita el permiso de ubicación
    this.actualizarMapa('Farmacias');
    this.detectarUbicacion();
  }

  detectarUbicacion(): void {
    if (!navigator.geolocation) {
      this.estadoUbicacion.set('denegada');
      return;
    }

    this.estadoUbicacion.set('detectando');
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        this.coordenadas.set({
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude
        });
        this.estadoUbicacion.set('activa');
        this.actualizarMapa(this.busquedaActual());
      },
      () => {
        // Si el usuario rechaza el permiso, el mapa sigue funcionando por IP/ciudad
        this.estadoUbicacion.set('denegada');
        this.actualizarMapa(this.busquedaActual());
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  filtrarLugar(categoria: string): void {
    this.busquedaActual.set(categoria);
    this.textoBuscador = '';
    this.actualizarMapa(categoria);
  }

  buscarPersonalizado(): void {
    const query = this.textoBuscador.trim();
    if (!query) return;
    this.busquedaActual.set(query);
    this.actualizarMapa(query);
  }

  private actualizarMapa(termino: string): void {
    const coords = this.coordenadas();
    let rawUrl = '';

    if (coords) {
      // Centra el mapa exactamente en las coordenadas GPS del usuario
      rawUrl = `https://maps.google.com/maps?q=${encodeURIComponent(termino)}&sll=${coords.lat},${coords.lng}&z=15&output=embed`;
    } else {
      rawUrl = `https://maps.google.com/maps?q=${encodeURIComponent(termino + ' cercanas')}&z=14&output=embed`;
    }

    this.mapaUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
  }

  obtenerEnlaceExterno(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.busquedaActual())}`;
  }
}