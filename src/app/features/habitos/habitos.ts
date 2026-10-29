import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitoService } from '../../core/services/habito';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitos.html',
  styleUrl: './habitos.css'
})
export class HabitosComponent {
  public habitoService = inject(HabitoService);
}