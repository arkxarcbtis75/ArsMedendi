import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, forkJoin } from 'rxjs';
import { TraductorService } from './traductor';

export interface FdaResultado {
  nombre: string;
  sustanciaActiva: string;
  paraQueSirve: string;
  marcasComerciales: string[];
  advertencias: string;
  viaAdministracion: string;
  fabricante?: string;
  imagenUrl: string;
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

  private extraerIndicaciones(item: any): string {
    return (
      item.purpose?.[0] ||
      item.indications_and_usage?.[0] ||
      item.active_ingredient?.[0] ||
      'Alivio sintomático y tratamiento según prescripción médica.'
    );
  }

  private extraerAdvertenciaRaw(item: any): string {
    return (
      item.warnings?.[0] ||
      item.warnings_and_cautions?.[0] ||
      item.boxed_warning?.[0] ||
      item.precautions?.[0] ||
      item.do_not_use?.[0] ||
      'Consultar al médico o farmacéutico antes de su uso.'
    );
  }

  private obtenerImagenPorVia(via: string): string {
    const viaUpper = via.toUpperCase();
    if (viaUpper.includes('INHAL') || viaUpper.includes('RESPIRATORY')) {
      return 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80';
    }
    if (viaUpper.includes('TOPIC') || viaUpper.includes('CREAM')) {
      return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80';
    }
    if (viaUpper.includes('INTRAVENOUS') || viaUpper.includes('SUBCUTANEOUS')) {
      return 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
  }

  buscarEnFda(query: string): Observable<FdaResultado[]> {
    if (!query || query.trim().length < 2) return of([]);

    const queryLimpia = this.normalizarTexto(query);
    const terminoIngles = this.diccionarioEspanolIngles[queryLimpia] || query.trim();
    const terminoLimpio = encodeURIComponent(terminoIngles);

    const url = `${this.apiUrl}?search=openfda.brand_name:"${terminoLimpio}"+OR+openfda.substance_name:"${terminoLimpio}"+OR+openfda.generic_name:"${terminoLimpio}"&limit=6`;

    return this.http.get<any>(url).pipe(
      switchMap(res => {
        if (!res.results || res.results.length === 0) return of([]);

        const peticiones$ = res.results.map((item: any) => {
          const indicacionesRaw = this.extraerIndicaciones(item);
          const advertenciaRaw = this.extraerAdvertenciaRaw(item);
          const viaRaw = (item.openfda?.route?.[0] || 'ORAL').toUpperCase();
          const viaTraducida = this.diccionarioVias[viaRaw] || viaRaw;

          // Extrae nombres de marcas comerciales asociadas
          const marcas: string[] = Array.from(
            new Set<string>([
              ...(item.openfda?.brand_name || []),
              ...(item.openfda?.generic_name || [])
            ])
          ).slice(0, 4);

          return forkJoin({
            indicacionesEsp: this.traductorService.traducirTexto(indicacionesRaw),
            advertenciaEsp: this.traductorService.traducirTexto(advertenciaRaw)
          }).pipe(
            map(traducido => ({
              nombre: item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0] || query,
              sustanciaActiva: item.openfda?.substance_name?.[0] || item.openfda?.generic_name?.[0] || 'No especificada',
              paraQueSirve: traducido.indicacionesEsp || 'Alivio de síntomas generales según indicación médica.',
              marcasComerciales: marcas.length > 0 ? marcas : [query],
              advertencias: traducido.advertenciaEsp || 'Consultar al médico antes de usar.',
              viaAdministracion: viaTraducida,
              fabricante: item.openfda?.manufacturer_name?.[0] || 'Farmacéutica Registrada FDA',
              imagenUrl: this.obtenerImagenPorVia(viaTraducida)
            }))
          );
        });

        return forkJoin(peticiones$) as Observable<FdaResultado[]>;
      }),
      catchError(() => of([]))
    );
  }
}