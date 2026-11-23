import { Injectable, inject, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.config';
import { HabitosService } from './habitos';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);
  private habitosService = inject(HabitosService);

  public usuario = signal<User | null>(null);
  public sincronizando = signal<boolean>(false);
  public ultimoRespaldo = signal<string | null>(null);

  constructor() {
    // Escucha cambios de sesión automáticamente al abrir la app
    onAuthStateChanged(this.auth, async (user) => {
      this.usuario.set(user);
      if (user) {
        await this.sincronizarAlIniciarSesion(user.uid);
      }
    });
  }

  async iniciarSesionGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async registrarConCorreo(correo: string, contrasena: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, correo, contrasena);
  }

  async iniciarSesionCorreo(correo: string, contrasena: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, correo, contrasena);
  }

  async cerrarSesion(): Promise<void> {
    await signOut(this.auth);
    this.ultimoRespaldo.set(null);
  }

  // Sube los datos locales actuales a Firestore
  async subirDatosANube(): Promise<void> {
    const user = this.usuario();
    if (!user) return;

    this.sincronizando.set(true);
    try {
      const perfilRaw = localStorage.getItem('ars_medendi_perfil');
      const habitosRaw = localStorage.getItem('ars_medendi_habitos');
      const medicamentosRaw = localStorage.getItem('ars_medendi_medicamentos');

      const payload = {
        email: user.email || '',
        perfil: perfilRaw ? JSON.parse(perfilRaw) : null,
        habitos: habitosRaw ? JSON.parse(habitosRaw) : [],
        medicamentos: medicamentosRaw ? JSON.parse(medicamentosRaw) : [],
        actualizadoEn: new Date().toISOString()
      };

      await setDoc(doc(this.db, 'usuarios', user.uid), payload, { merge: true });
      this.ultimoRespaldo.set(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      this.sincronizando.set(false);
    }
  }

  // Al conectar cuenta: si hay respaldo en la nube lo descarga; si es cuenta nueva, sube los datos locales
  private async sincronizarAlIniciarSesion(uid: string): Promise<void> {
    this.sincronizando.set(true);
    try {
      const ref = doc(this.db, 'usuarios', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        if (data['perfil']) {
          localStorage.setItem('ars_medendi_perfil', JSON.stringify(data['perfil']));
          this.habitosService.actualizarDatosBiometricos(
            Number(data['perfil'].edad) || 25,
            Number(data['perfil'].peso) || 70,
            Number(data['perfil'].altura) || 170,
            data['perfil'].genero || 'otro'
          );
        }

        if (Array.isArray(data['habitos'])) {
          localStorage.setItem('ars_medendi_habitos', JSON.stringify(data['habitos']));
          const hoyStr = new Date().toISOString().split('T')[0];
          const hoy = data['habitos'].find((h: any) => h.fecha === hoyStr);
          if (hoy) {
            this.habitosService.guardarRegistroHoy({
              aguaMl: Number(hoy.aguaMl) || 0,
              suenoHoras: Number(hoy.suenoHoras) || 0,
              ejercicioMin: Number(hoy.ejercicioMin) || 0
            });
          }
        }

        if (Array.isArray(data['medicamentos'])) {
          localStorage.setItem('ars_medendi_medicamentos', JSON.stringify(data['medicamentos']));
        }

        this.ultimoRespaldo.set('Sincronizado desde la nube');
      } else {
        // Primera vez del usuario: respalda lo que ya tenía guardado localmente
        await this.subirDatosANube();
      }
    } finally {
      this.sincronizando.set(false);
    }
  }
}