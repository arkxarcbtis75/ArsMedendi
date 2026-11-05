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
    return this.traducir(texto, 'en', 'es');
  }

  traducirTextoAIngles(texto: string): Observable<string> {
    return this.traducir(texto, 'es', 'en');
  }

  private traducir(texto: string, origen: string, destino: string): Observable<string> {
    if (!texto || texto.trim().length === 0) return of('');

    // Limpiamos y limitamos a la primera oración relevante (máximo 180 caracteres)
    const textoLimpio = texto.replace(/^Warnings\s*/i, '').replace(/[\r\n]+/g, ' ').substring(0, 180).trim();
    
    // El parámetro 'de' le otorga a la app prioridad y cuota de 10,000 palabras/día libres
    const url = `${this.apiUrl}?q=${encodeURIComponent(textoLimpio)}&langpair=${origen}|${destino}&de=admin@arsmedendi.com`;

    return this.http.get<any>(url).pipe(
      map(res => {
        if (res.responseStatus === 200 && res.responseData?.translatedText) {
          return res.responseData.translatedText;
        }
        return textoLimpio;
      }),
      catchError(() => of(textoLimpio))
    );
  }
}