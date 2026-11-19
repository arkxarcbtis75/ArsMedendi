import { Injectable, signal, computed } from '@angular/core';

export interface RegistroHabitoDiario {
  fecha: string;          // Formato YYYY-MM-DD
  aguaMl: number;         // Mililitros consumidos
  suenoHoras: number;     // Horas dormidas
  ejercicioMin: number;   // Minutos de actividad física
}

export interface MetasIdeales {
  aguaMl: number;
  suenoHoras: number;
  ejercicioMin: number;
}

export interface DatosPerfilBasico {
  edad: number;
  peso: number;
  genero: 'masculino' | 'femenino' | 'otro';
  completado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HabitosService {
  private readonly STORAGE_HABITOS = 'ars_medendi_habitos';
  private readonly STORAGE_PERFIL = 'ars_medendi_perfil';

  // Registro del día actual
  public registroHoy = signal<RegistroHabitoDiario>(this.cargarRegistroDeHoy());

  // Datos biométricos del usuario (lee del perfil o usa valores base referenciales)
  public perfilUsuario = signal<DatosPerfilBasico>(this.cargarPerfil());

  // Cálculo automático de metas ideales según edad, peso y género
  public metasIdeales = computed<MetasIdeales>(() => {
    const { edad, peso, genero } = this.perfilUsuario();
    const pesoValido = peso > 20 ? peso : 70;
    const edadValida = edad > 0 ? edad : 25;

    // 1. Hidratación ideal (OMS / EFSA: ~30-35 ml por kg de peso)
    let factorAgua = edadValida >= 65 ? 30 : 35;
    let aguaIdeal = Math.round((pesoValido * factorAgua) / 50) * 50; // Redondeado a múltiplos de 50ml
    if (genero === 'masculino') aguaIdeal += 200;

    // 2. Sueño ideal según grupo de edad (CDC / National Sleep Foundation)
    let suenoIdeal = 8;
    if (edadValida < 18) suenoIdeal = 9;
    else if (edadValida >= 65) suenoIdeal = 7.5;

    // 3. Actividad física diaria recomendada (OMS: 150-300 min semanales)
    let ejercicioIdeal = 30;
    if (edadValida < 30) ejercicioIdeal = 40;
    else if (edadValida >= 65) ejercicioIdeal = 25;

    return {
      aguaMl: aguaIdeal,
      suenoHoras: suenoIdeal,
      ejercicioMin: ejercicioIdeal
    };
  });

  // Porcentajes de cumplimiento para los anillos (0 a 100%)
  public porcentajes = computed(() => {
    const hoy = this.registroHoy();
    const meta = this.metasIdeales();

    return {
      agua: Math.min(Math.round((hoy.aguaMl / meta.aguaMl) * 100), 100),
      sueno: Math.min(Math.round((hoy.suenoHoras / meta.suenoHoras) * 100), 100),
      ejercicio: Math.min(Math.round((hoy.ejercicioMin / meta.ejercicioMin) * 100), 100)
    };
  });

  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private cargarPerfil(): DatosPerfilBasico {
    try {
      const raw = localStorage.getItem(this.STORAGE_PERFIL);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.edad && data.peso) {
          return {
            edad: Number(data.edad),
            peso: Number(data.peso),
            genero: (data.genero || 'otro').toLowerCase(),
            completado: true
          };
        }
      }
    } catch {}
    return { edad: 25, peso: 70, genero: 'otro', completado: false };
  }

  public actualizarDatosBiometricos(edad: number, peso: number, genero: 'masculino' | 'femenino' | 'otro'): void {
    const nuevoPerfil: DatosPerfilBasico = { edad, peso, genero, completado: true };
    this.perfilUsuario.set(nuevoPerfil);
    localStorage.setItem(this.STORAGE_PERFIL, JSON.stringify(nuevoPerfil));
  }

  private cargarRegistroDeHoy(): RegistroHabitoDiario {
    const hoyStr = this.obtenerFechaHoy();
    try {
      const raw = localStorage.getItem(this.STORAGE_HABITOS);
      if (raw) {
        const historial: RegistroHabitoDiario[] = JSON.parse(raw);
        const encontrado = historial.find(r => r.fecha === hoyStr);
        if (encontrado) return encontrado;
      }
    } catch {}
    return { fecha: hoyStr, aguaMl: 0, suenoHoras: 0, ejercicioMin: 0 };
  }

  public guardarRegistroHoy(datos: Omit<RegistroHabitoDiario, 'fecha'>): void {
    const hoyStr = this.obtenerFechaHoy();
    const actualizado: RegistroHabitoDiario = { fecha: hoyStr, ...datos };
    this.registroHoy.set(actualizado);

    try {
      const raw = localStorage.getItem(this.STORAGE_HABITOS);
      const historial: RegistroHabitoDiario[] = raw ? JSON.parse(raw) : [];
      const index = historial.findIndex(r => r.fecha === hoyStr);

      if (index >= 0) {
        historial[index] = actualizado;
      } else {
        historial.push(actualizado);
      }
      localStorage.setItem(this.STORAGE_HABITOS, JSON.stringify(historial));
    } catch {}
  }

  public sumarAgua(ml: number): void {
    const actual = this.registroHoy();
    this.guardarRegistroHoy({
      ...actual,
      aguaMl: Math.max(0, actual.aguaMl + ml)
    });
  }
}