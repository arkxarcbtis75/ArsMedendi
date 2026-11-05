import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, forkJoin } from 'rxjs';
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

  private diccionarioEspanolIngles: { [key: string]: string } = {
    'aspirina': 'aspirin',
    'paracetamol': 'acetaminophen',
    'ibuprofeno': 'ibuprofen',
    'amoxicilina': 'amoxicillin',
    'omeprazol': 'omeprazole',
    'loratadina': 'loratadine',
    'salbutamol': 'albuterol',
    'naproxeno': 'naproxen',
    'metformina': 'metformin',
    'losartan': 'losartan',
    'clonazepam': 'clonazepam',
    'diazepam': 'diazepam',
    'insulina': 'insulin',
    'ketorolaco': 'ketorolac',
    'diclofenaco': 'diclofenac'
  };

  private diccionarioVias: { [key: string]: string } = {
    'ORAL': 'Oral',
    'TOPICAL': 'Tópica',
    'INTRAVENOUS': 'Intravenosa',
    'INTRAMUSCULAR': 'Intramuscular',
    'OPHTHALMIC': 'Oftálmica',
    'NASAL': 'Nasal',
    'RESPIRATORY (INHALATION)': 'Inhalatoria',
    'SUBCUTANEOUS': 'Subcutánea'
  };

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private extraerAdvertenciaRaw(item: any): string {
    return (
      item.warnings?.[0] ||
      item.warnings_and_cautions?.[0] ||
      item.boxed_warning?.[0] ||
      item.precautions?.[0] ||
      item.do_not_use?.[0] ||
      item.stop_use?.[0] ||
      'Sin advertencias específicas registradas.'
    );
  }

  buscarEnFda(query: string): Observable<FdaResultado[]> {
    if (!query || query.trim().length < 2) return of([]);

    const queryLimpia = this.normalizarTexto(query);
    // Busca en diccionario rápido o envía el término tal cual a openFDA
    const terminoIngles = this.diccionarioEspanolIngles[queryLimpia] || query.trim();
    const terminoLimpio = encodeURIComponent(terminoIngles);

    const url = `${this.apiUrl}?search=openfda.brand_name:"${terminoLimpio}"+OR+openfda.substance_name:"${terminoLimpio}"+OR+openfda.generic_name:"${terminoLimpio}"&limit=4`;

    return this.http.get<any>(url).pipe(
      switchMap(res => {
        if (!res.results || res.results.length === 0) return of([]);

        const peticiones$ = res.results.map((item: any) => {
          const advertenciaRaw = this.extraerAdvertenciaRaw(item);
          const viaRaw = (item.openfda?.route?.[0] || 'ORAL').toUpperCase();
          const viaTraducida = this.diccionarioVias[viaRaw] || viaRaw;

          return this.traductorService.traducirTexto(advertenciaRaw).pipe(
            map(advertenciaTraducida => ({
              nombre: item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0] || query,
              sustanciaActiva: item.openfda?.substance_name?.[0] || item.openfda?.generic_name?.[0] || 'No especificada',
              advertencias: advertenciaTraducida || 'Sin advertencias específicas registradas.',
              viaAdministracion: viaTraducida,
              fabricante: item.openfda?.manufacturer_name?.[0] || 'No especificado'
            }))
          );
        });

        return forkJoin(peticiones$) as Observable<FdaResultado[]>;
      }),
      catchError(() => of([]))
    );
  }
}