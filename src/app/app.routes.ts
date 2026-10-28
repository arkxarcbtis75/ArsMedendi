import { Routes } from '@angular/router';
import { MedicamentosComponent } from './features/medicamentos/medicamentos';
import { RecordatoriosComponent } from './features/recordatorios/recordatorios';

export const routes: Routes = [
  { path: '', component: RecordatoriosComponent },
  { path: 'medicamentos', component: MedicamentosComponent },
];