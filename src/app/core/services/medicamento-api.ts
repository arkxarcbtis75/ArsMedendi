import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

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
  private apiUrl = 'https://api.fda.gov/drug/label.json';

  buscarEnFda(query: string): Observable<FdaResultado[]> {
    if (!query || query.trim().length < 2) return of([]);

    const terminoLimpio = encodeURIComponent(query.trim());
    const url = `${this.apiUrl}?search=openfda.brand_name:"${terminoLimpio}"+OR+openfda.substance_name:"${terminoLimpio}"+OR+openfda.generic_name:"${terminoLimpio}"&limit=6`;

    return this.http.get<any>(url).pipe(
      map(res => {
        if (!res.results || res.results.length === 0) return [];
        
        return res.results.map((item: any) => ({
          nombre: item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0] || query,
          sustanciaActiva: item.openfda?.substance_name?.[0] || item.openfda?.generic_name?.[0] || 'No especificada',
          advertencias: item.warnings?.[0] || item.warnings_and_cautions?.[0] || item.precautions?.[0] || 'Sin advertencias específicas registradas.',
          viaAdministracion: item.openfda?.route?.[0] || 'No especificada',
          fabricante: item.openfda?.manufacturer_name?.[0] || 'No especificado'
        }));
      }),
      catchError(() => of([]))
    );
  }
}