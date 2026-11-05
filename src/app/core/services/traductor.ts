import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraductorService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.mymemory.translated.net/get';

  // Traduce de Inglés a Español (para mostrar advertencias)
  traducirTexto(texto: string): Observable<string> {
    return this.traducir(texto, 'en', 'es');
  }

  // Traduce de Español a Inglés (para enviarle a openFDA)
  traducirTextoAIngles(texto: string): Observable<string> {
    return this.traducir(texto, 'es', 'en');
  }

  private traducir(texto: string, origen: string, destino: string): Observable<string> {
    if (!texto || texto.trim().length === 0) return of('');

    const textoRecortado = texto.substring(0, 450);
    const url = `${this.apiUrl}?q=${encodeURIComponent(textoRecortado)}&langpair=${origen}|${destino}`;

    return this.http.get<any>(url).pipe(
      map(res => res.responseData?.translatedText || texto),
      catchError(() => of(texto))
    );
  }
}