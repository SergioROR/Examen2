import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../usuario/usuario.service';
import { PlantelService } from '../../plantel/plantel.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  usuario = {
    nombre: '',
    apellidos: '',
    correo: '',
    password: '',
    confirmPassword: '',
    rol: '',
    id_plantel: ''
  };

  listaPlanteles: any[] = [];
  mensaje = '';
  mensajeError = '';
  isLoading = false;
  formSubmitted = false;

  // Image preview
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  // Toggle password visibility
  showPassword = false;
  showConfirm = false;

  constructor(
    private usuarioService: UsuarioService,
    private plantelService: PlantelService
  ) {}

  ngOnInit() {
    this.cargarPlanteles();
  }

  cargarPlanteles() {
    this.plantelService.VerPlanteles().subscribe({
      next: (data) => {
        console.log('PLANTELES:', data);
        this.listaPlanteles = data;
      },
      error: (err) => {
        console.error('Error al cargar planteles', err);
        this.mensajeError = 'No se pudieron cargar los planteles';
      }
    });
  }

  /** Open the hidden file input */
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /** Handle file selection and show preview */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.mensajeError = 'Solo se permiten imágenes JPG, PNG, GIF o WebP';
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.mensajeError = 'La imagen no debe superar 5MB';
      return;
    }

    this.selectedFile = file;
    this.mensajeError = '';

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** Full form validation */
  private isFormValid(): boolean {
    let valid = true;
    const msgs: string[] = [];

    if (!this.usuario.nombre.trim() || this.usuario.nombre.trim().length < 2) {
      msgs.push('El nombre debe tener al menos 2 caracteres');
      valid = false;
    }

    if (!this.usuario.apellidos.trim() || this.usuario.apellidos.trim().length < 2) {
      msgs.push('Los apellidos deben tener al menos 2 caracteres');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.usuario.correo.trim() || !emailRegex.test(this.usuario.correo)) {
      msgs.push('Ingresa un correo electrónico válido');
      valid = false;
    }

    if (!this.usuario.password || this.usuario.password.length < 6) {
      msgs.push('La contraseña debe tener al menos 6 caracteres');
      valid = false;
    }

    if (this.usuario.password !== this.usuario.confirmPassword) {
      msgs.push('Las contraseñas no coinciden');
      valid = false;
    }

    if (!this.usuario.rol) {
      msgs.push('Debes seleccionar un rol');
      valid = false;
    }

    if (!this.usuario.id_plantel) {
      msgs.push('Debes seleccionar un plantel');
      valid = false;
    }

    if (!valid) {
      this.mensajeError = msgs[0]; // show first error
    }

    return valid;
  }

  guardarUsuario() {
    this.formSubmitted = true;
    this.mensaje = '';
    this.mensajeError = '';

    if (!this.isFormValid()) return;

    this.isLoading = true;

    // Build payload (exclude confirmPassword)
    const payload = {
      nombre: this.usuario.nombre.trim(),
      apellidos: this.usuario.apellidos.trim(),
      correo: this.usuario.correo.trim(),
      password: this.usuario.password,
      rol: this.usuario.rol,
      id_plantel: this.usuario.id_plantel
    };

    console.log('USUARIO A ENVIAR:', payload);

    this.usuarioService.crearUsuario(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mensaje = '✓ Usuario creado correctamente';
        this.mensajeError = '';
        this.resetForm();
        console.log(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeError = err.error?.mensaje || 'Error al crear usuario';
      }
    });
  }

  private resetForm() {
    this.usuario = {
      nombre: '',
      apellidos: '',
      correo: '',
      password: '',
      confirmPassword: '',
      rol: '',
      id_plantel: ''
    };
    this.previewUrl = null;
    this.selectedFile = null;
    this.formSubmitted = false;
    this.showPassword = false;
    this.showConfirm = false;
  }
}