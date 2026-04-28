import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../usuario/usuario.service';
import { PlantelService } from '../../plantel/plantel.service';
import { AvatarService } from '../../avatares/avatares.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {

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
  mensaje        = '';
  mensajeError   = '';
  isLoading      = false;
  formSubmitted  = false;

  // Avatar
  avatares: string[]              = [];
  avatarSeleccionado: string | null = null;
  avatarTemporal: string | null     = null;
  modalAvatarAbierto                = false;
  cargandoAvatares                  = false;

  // Toggle password
  showPassword = false;
  showConfirm  = false;

  constructor(
    private usuarioService: UsuarioService,
    private plantelService: PlantelService,
    private avatarSvc: AvatarService
  ) {}

  ngOnInit(): void {
    this.cargarPlanteles();
  }

  cargarPlanteles(): void {
    this.plantelService.VerPlanteles().subscribe({
      next: (data) => this.listaPlanteles = data,
      error: ()     => this.mensajeError = 'No se pudieron cargar los planteles'
    });
  }

  // ── Avatar ───────────────────────────────────────────────

  abrirSelectorAvatar(): void {
    this.modalAvatarAbierto = true;
    this.avatarTemporal     = this.avatarSeleccionado;
    if (this.avatares.length === 0) {
      this.cargandoAvatares = true;
      this.avatarSvc.ListarAvatares().subscribe({
        next: (data) => { this.avatares = data; this.cargandoAvatares = false; },
        error: ()    => { this.cargandoAvatares = false; }
      });
    }
  }

  cerrarSelectorAvatar(): void {
    this.modalAvatarAbierto = false;
    this.avatarTemporal     = null;
  }

  confirmarAvatar(): void {
    this.avatarSeleccionado = this.avatarTemporal;
    this.modalAvatarAbierto = false;
  }

  getUrlAvatar(imagen: string | null): string {
    return this.avatarSvc.GetUrlAvatar(imagen);
  }

  // ── Guardar ──────────────────────────────────────────────

  guardarUsuario(): void {
    this.formSubmitted = true;
    this.mensaje       = '';
    this.mensajeError  = '';

    if (!this.isFormValid()) return;

    this.isLoading = true;

    const payload = {
      nombre:     this.usuario.nombre.trim(),
      apellidos:  this.usuario.apellidos.trim(),
      correo:     this.usuario.correo.trim(),
      password:   this.usuario.password,
      rol:        this.usuario.rol,
      id_plantel: this.usuario.id_plantel,
      imagen:     this.avatarSeleccionado
    };

    this.usuarioService.crearUsuario(payload).subscribe({
      next: () => {
        this.isLoading   = false;
        this.mensaje     = '✓ Usuario creado correctamente';
        this.mensajeError = '';
        this.resetForm();
      },
      error: (err) => {
        this.isLoading   = false;
        this.mensajeError = err.error?.mensaje || 'Error al crear usuario';
      }
    });
  }

  private isFormValid(): boolean {
    const msgs: string[] = [];

    if (!this.usuario.nombre.trim() || this.usuario.nombre.trim().length < 2)
      msgs.push('El nombre debe tener al menos 2 caracteres');
    if (!this.usuario.apellidos.trim() || this.usuario.apellidos.trim().length < 2)
      msgs.push('Los apellidos deben tener al menos 2 caracteres');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.usuario.correo))
      msgs.push('Ingresa un correo electrónico válido');
    if (!this.usuario.password || this.usuario.password.length < 6)
      msgs.push('La contraseña debe tener al menos 6 caracteres');
    if (this.usuario.password !== this.usuario.confirmPassword)
      msgs.push('Las contraseñas no coinciden');
    if (!this.usuario.rol)
      msgs.push('Debes seleccionar un rol');
    if (!this.usuario.id_plantel)
      msgs.push('Debes seleccionar un plantel');

    if (msgs.length > 0) { this.mensajeError = msgs[0]; return false; }
    return true;
  }

  private resetForm(): void {
    this.usuario = {
      nombre: '', apellidos: '', correo: '',
      password: '', confirmPassword: '', rol: '', id_plantel: ''
    };
    this.avatarSeleccionado = null;
    this.formSubmitted      = false;
    this.showPassword       = false;
    this.showConfirm        = false;
  }
}