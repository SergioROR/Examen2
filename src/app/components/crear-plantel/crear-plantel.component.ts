import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlantelService } from '../../plantel/plantel.service';  // ajusta ruta

interface PlantelForm {
  nombre: string;
}

@Component({
  selector: 'app-crear-plantel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './crear-plantel.component.html',
  styleUrl: './crear-plantel.component.css'
})
export class CrearPlantelComponent {

  plantel: PlantelForm = { nombre: '' };
  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;

  enviando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(private plantelService: PlantelService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.mensajeError = 'Solo se permiten archivos de imagen';
        return;
      }

      this.archivoSeleccionado = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.plantel.nombre.trim() || !this.archivoSeleccionado) {
      this.mensajeError = 'Completa todos los campos requeridos (nombre e imagen)';
      return;
    }

    this.enviando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    console.log('Enviando →', this.plantel.nombre, this.archivoSeleccionado.name);

    this.plantelService.AgregarPlanteles(this.plantel.nombre, this.archivoSeleccionado)
      .subscribe({
        next: (respuesta) => {
          this.enviando = false;
          this.mensajeExito = `Plantel "${respuesta.nombre}" creado correctamente`;

          this.plantel = { nombre: '' };
          this.archivoSeleccionado = null;
          this.previewUrl = null;

          const inputFile = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (inputFile) inputFile.value = '';
        },
        error: (err) => {
          this.enviando = false;
          console.error('Error:', err);

          let mensaje = 'Error al crear el plantel. Intenta nuevamente.';
          if (err.status === 0) mensaje = 'No hay conexión con el servidor.';
          else if (err.error?.mensaje) mensaje = err.error.mensaje;
          else if (err.status === 413) mensaje = 'Imagen muy grande.';
          else if (err.status === 400) mensaje = 'Datos inválidos.';

          this.mensajeError = mensaje;
        }
      });
  }
}