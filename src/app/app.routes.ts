import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { 
    path: 'inicio', 
    loadComponent: () => import('./features/inicio/inicio').then(m => m.InicioComponent) 
  },
  { 
    path: 'recordatorios', 
    loadComponent: () => import('./features/recordatorios/recordatorios').then(m => m.RecordatoriosComponent) 
  },
  { 
    path: 'medicamentos', 
    loadComponent: () => import('./features/medicamentos/medicamentos').then(m => m.MedicamentosComponent) 
  },
  { 
    path: 'buscador', 
    loadComponent: () => import('./features/buscador/buscador').then(m => m.BuscadorComponent) 
  },
  { 
    path: 'habitos', 
    loadComponent: () => import('./features/habitos/habitos').then(m => m.HabitosComponent) 
  },
  { 
    path: 'mapa', 
    loadComponent: () => import('./features/mapa/mapa').then(m => m.MapaComponent) 
  },
  { 
    path: 'perfil', 
    loadComponent: () => import('./features/perfil/perfil').then(m => m.PerfilComponent) 
  },
  { path: '**', redirectTo: 'inicio' }
];