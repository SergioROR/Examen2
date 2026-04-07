import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PlantelService } from '../../plantel/plantel.service';

@Component({
  selector: 'app-crear-plantel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-plantel.component.html',
  styleUrls: ['./crear-plantel.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CrearPlantelComponent {

  nombre            = '';
  archivoSeleccionado: File | null = null;
  previewUrl:       string | null = null;

  enviando          = false;
  mensajeExito:     string | null = null;
  mensajeError:     string | null = null;

  constructor(
    private plantelService: PlantelService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.mensajeError = 'Solo se permiten archivos de imagen';
      return;
    }

    this.archivoSeleccionado = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
    this.mensajeError = null;
  }

  quitarImagen(): void {
    this.archivoSeleccionado = null;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (!this.nombre.trim()) {
      this.mensajeError = 'El nombre del plantel es obligatorio';
      return;
    }
    if (!this.archivoSeleccionado) {
      this.mensajeError = 'Debes seleccionar una imagen';
      return;
    }

    this.enviando     = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    this.plantelService.AgregarPlanteles(this.nombre, this.archivoSeleccionado)
      .subscribe({
        next: (resp) => {
          this.enviando     = false;
          this.mensajeExito = `Plantel "${resp.nombre}" creado correctamente`;
          setTimeout(() => this.router.navigate(['/planteles']), 1500);
        },
        error: (err) => {
          this.enviando = false;
          if      (err.status === 0)   this.mensajeError = 'Sin conexión con el servidor.';
          else if (err.status === 413) this.mensajeError = 'La imagen es demasiado grande.';
          else if (err.status === 400) this.mensajeError = 'Datos inválidos.';
          else    this.mensajeError = err.error?.mensaje || 'Error al crear el plantel.';
        }
      });
  }
}