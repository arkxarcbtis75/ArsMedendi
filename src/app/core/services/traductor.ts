import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraductorService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.mymemory.translated.net/get';

  traducirTexto(texto: string): Observable<string> {
    if (!texto || texto.trim().length === 0) return of('');

    // Limitamos el fragmento de texto para optimizar la respuesta de la API
    const textoRecortado = texto.substring(0, 450);
    const url = `${this.apiUrl}?q=${encodeURIComponent(textoRecortado)}&langpair=en|es`;

    return this.http.get<any>(url).pipe(
      map(res => res.responseData?.translatedText || texto),
      catchError(() => of(texto)) // Si la API de traducción no responde, mantiene el texto original
    );
  }
}