import { Routes } from '@angular/router';
import { RecordatoriosComponent } from './features/recordatorios/recordatorios';
import { MedicamentosComponent } from './features/medicamentos/medicamentos';
import { HabitosComponent } from './features/habitos/habitos';
import { BuscadorComponent } from './features/buscador/buscador';
import { MapaComponent } from './features/mapa/mapa';
import { PerfilComponent } from './features/perfil/perfil';

export const routes: Routes = [
  { path: '', component: RecordatoriosComponent },
  { path: 'medicamentos', component: MedicamentosComponent },
  { path: 'habitos', component: HabitosComponent },
  { path: 'buscador', component: BuscadorComponent },
  { path: 'mapa', component: MapaComponent },
  { path: 'perfil', component: PerfilComponent },
];