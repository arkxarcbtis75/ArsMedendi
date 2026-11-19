import { Injectable, signal, computed } from '@angular/core';

export interface RegistroHabitoDiario {
  fecha: string;
  aguaMl: number;
  suenoHoras: number;
  ejercicioMin: number;
}

export interface MetasIdeales {
  aguaMl: number;
  suenoHoras: number;
  ejercicioMin: number;
}

export interface DatosPerfilBasico {
  edad: number;
  peso: number;
  altura: number; // En centímetros (ej. 170)
  genero: 'masculino' | 'femenino' | 'otro';
  completado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HabitosService {
  private readonly STORAGE_HABITOS = 'ars_medendi_habitos';
  private readonly STORAGE_PERFIL = 'ars_medendi_perfil';

  public registroHoy = signal<RegistroHabitoDiario>(this.cargarRegistroDeHoy());
  public perfilUsuario = signal<DatosPerfilBasico>(this.cargarPerfil());

  // Cálculo automático del IMC (Índice de Masa Corporal)
  public imcInfo = computed(() => {
    const { peso, altura } = this.perfilUsuario();
    const pesoValido = peso > 20 ? peso : 70;
    const alturaMetros = (altura > 80 ? altura : 170) / 100;

    const valor = Number((pesoValido / (alturaMetros * alturaMetros)).toFixed(1));
    let categoria = 'Normal';

    if (valor < 18.5) categoria = 'Bajo peso';
    else if (valor >= 25 && valor < 30) categoria = 'Sobrepeso';
    else if (valor >= 30) categoria = 'Obesidad';

    return { valor, categoria };
  });

  // Cálculo automático de metas ideales según edad, peso, altura y género
  public metasIdeales = computed<MetasIdeales>(() => {
    const { edad, peso, altura, genero } = this.perfilUsuario();
    const pesoValido = peso > 20 ? peso : 70;
    const alturaMetros = (altura > 80 ? altura : 170) / 100;
    const edadValida = edad > 0 ? edad : 25;

    // Si el IMC es alto (> 30), usamos un peso ajustado para no exigir cantidades excesivas de agua
    const imcActual = pesoValido / (alturaMetros * alturaMetros);
    const pesoIdealAprox = 22 * (alturaMetros * alturaMetros);
    const pesoCalculoAgua = imcActual > 30
      ? pesoIdealAprox + 0.4 * (pesoValido - pesoIdealAprox)
      : pesoValido;

    // 1. Hidratación ideal (OMS / EFSA: ~30-35 ml por kg)
    const factorAgua = edadValida >= 65 ? 30 : 35;
    let aguaIdeal = Math.round((pesoCalculoAgua * factorAgua) / 50) * 50;
    if (genero === 'masculino') aguaIdeal += 200;

    // 2. Sueño ideal según grupo de edad
    let suenoIdeal = 8;
    if (edadValida < 18) suenoIdeal = 9;
    else if (edadValida >= 65) suenoIdeal = 7.5;

    // 3. Actividad física diaria recomendada
    let ejercicioIdeal = 30;
    if (edadValida < 30 && imcActual < 30) ejercicioIdeal = 40;
    else if (edadValida >= 65 || imcActual >= 30) ejercicioIdeal = 30;

    return {
      aguaMl: aguaIdeal,
      suenoHoras: suenoIdeal,
      ejercicioMin: ejercicioIdeal
    };
  });

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
            altura: Number(data.altura) || 170,
            genero: (data.genero || 'otro').toLowerCase(),
            completado: true
          };
        }
      }
    } catch {}
    return { edad: 25, peso: 70, altura: 170, genero: 'otro', completado: false };
  }

  public actualizarDatosBiometricos(
    edad: number,
    peso: number,
    altura: number,
    genero: 'masculino' | 'femenino' | 'otro'
  ): void {
    const nuevoPerfil: DatosPerfilBasico = { edad, peso, altura, genero, completado: true };
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
}