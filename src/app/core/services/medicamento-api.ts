import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface FdaResultado {
  nombre: string;
  sustanciaActiva: string;
  advertencias: string;
  viaAdministracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicamentoApiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.fda.gov/drug/label.json';

  buscarEnFda(query: string): Observable<FdaResultado[]> {
    if (!query || query.trim().length < 2) return of([]);

    const url = `${this.apiUrl}?search=openfda.brand_name:"${query}"+OR+openfda.substance_name:"${query}"&limit=5`;

    return this.http.get<any>(url).pipe(
      map(res => {
        if (!res.results) return [];
        return res.results.map((item: any) => ({
          nombre: item.openfda?.brand_name?.[0] || query,
          sustanciaActiva: item.openfda?.substance_name?.[0] || 'Sustancia no especificada',
          advertencias: item.warnings?.[0] || item.warnings_and_cautions?.[0] || 'Consulte a su médico antes de consumir.',
          viaAdministracion: item.openfda?.route?.[0] || 'Oral'
        }));
      }),
      catchError(() => of([]))
    );
  }
}