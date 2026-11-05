import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, forkJoin, switchMap } from 'rxjs';
import { TraductorService } from './traductor';

export interface FdaResultado {
  nombre: string;
  sustanciaActiva: string;
  advertencias: string;
  viaAdministracion: string;
  fabricante?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicamentoApiService {
  private http = inject(HttpClient);
  private traductorService = inject(TraductorService);
  private apiUrl = 'https://api.fda.gov/drug/label.json';

  buscarEnFda(query: string): Observable<FdaResultado[]> {
    if (!query || query.trim().length < 2) return of([]);

    const terminoLimpio = encodeURIComponent(query.trim());
    const url = `${this.apiUrl}?search=openfda.brand_name:"${terminoLimpio}"+OR+openfda.substance_name:"${terminoLimpio}"+OR+openfda.generic_name:"${terminoLimpio}"&limit=4`;

    return this.http.get<any>(url).pipe(
      switchMap(res => {
        if (!res.results || res.results.length === 0) return of([]);

        // Procesamos las traducciones en paralelo para cada medicamento encontrado
        const peticionesTraduccion$ = res.results.map((item: any) => {
          const advertenciaEng = item.warnings?.[0] || item.warnings_and_cautions?.[0] || item.precautions?.[0] || 'Sin advertencias específicas registradas.';
          const viaEng = item.openfda?.route?.[0] || 'Oral';

          return forkJoin({
            advertenciaEsp: this.traductorService.traducirTexto(advertenciaEng),
            viaEsp: this.traductorService.traducirTexto(viaEng)
          }).pipe(
            map(traducido => ({
              nombre: item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0] || query,
              sustanciaActiva: item.openfda?.substance_name?.[0] || item.openfda?.generic_name?.[0] || 'No especificada',
              advertencias: traducido.advertenciaEsp,
              viaAdministracion: traducido.viaEsp,
              fabricante: item.openfda?.manufacturer_name?.[0] || 'No especificado'
            }))
          );
        });

        return forkJoin(peticionesTraduccion$) as Observable<FdaResultado[]>;
      }),
      catchError(() => of([]))
    );
  }
}