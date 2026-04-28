import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../usuario/usuario.service';
import { PlantelService } from '../../plantel/plantel.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare const bootstrap: any;

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  terminoBusqueda        = '';
  listaActivos:   any[]  = [];
  listaInactivos: any[]  = [];
  listaActivosFiltrada:   any[] = [];
  listaInactivosFiltrada: any[] = [];

  usuarioSeleccionado: any = null;
  nuevaContrasena    = '';
  confirmarContrasena = '';
  mensajeConfirmacion = '';
  accionConfirmada: () => void = () => {};

  // Edición
  modalEditarAbierto = false;
  editCargando       = false;
  editError          = '';
  listaPlanteles:  any[] = [];
  formEditar = {
    id_usuario: 0, nombre: '', apellidos: '',
    correo: '', rol: '', id_plantel: 0
  };

  readonly baseUrl = 'http://localhost:3005';

  constructor(
    private usuarioService: UsuarioService,
    private plantelService: PlantelService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPlanteles();
  }

  cargarUsuarios(): void {
    this.usuarioService.MostrarUsuarios().subscribe({
      next: (usuarios) => {
        this.listaActivos   = usuarios.filter((u: any) => u.estado === true);
        this.listaInactivos = usuarios.filter((u: any) => u.estado === false);
        this.listaActivosFiltrada   = [...this.listaActivos];
        this.listaInactivosFiltrada = [...this.listaInactivos];
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  cargarPlanteles(): void {
    this.plantelService.VerPlanteles().subscribe({
      next: (data) => this.listaPlanteles = data,
      error: () => {}
    });
  }

  getAvatarUrl(imagen: string | null): string {
    if (!imagen) return '';
    return `${this.baseUrl}/imagenes/avatares/${imagen}`;
  }

  // ── Filtrar ──────────────────────────────────────────────
  filtrarUsuarios(): void {
    const t = this.terminoBusqueda.toLowerCase().trim();
    this.listaActivosFiltrada   = this.listaActivos.filter(u =>
      u.nombre?.toLowerCase().includes(t) ||
      u.apellidos?.toLowerCase().includes(t) ||
      u.correo?.toLowerCase().includes(t)
    );
    this.listaInactivosFiltrada = this.listaInactivos.filter(u =>
      u.nombre?.toLowerCase().includes(t) ||
      u.apellidos?.toLowerCase().includes(t) ||
      u.correo?.toLowerCase().includes(t)
    );
  }

  // ── Editar ───────────────────────────────────────────────
  abrirEditar(usuario: any): void {
    this.editError = '';
    this.formEditar = {
      id_usuario: usuario.id_usuario,
      nombre:     usuario.nombre,
      apellidos:  usuario.apellidos,
      correo:     usuario.correo,
      rol:        usuario.rol,
      id_plantel: usuario.id_plantel
    };
    this.modalEditarAbierto = true;
  }

  cerrarEditar(): void {
    this.modalEditarAbierto = false;
    this.editError = '';
  }

  guardarEdicion(): void {
    if (!this.formEditar.nombre.trim() || !this.formEditar.correo.trim()) {
      this.editError = 'Nombre y correo son obligatorios'; return;
    }
    this.editCargando = true;
    this.usuarioService.editarUsuario(this.formEditar).subscribe({
      next: () => {
        this.editCargando = false;
        this.cerrarEditar();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.editError    = err.error?.mensaje || 'Error al guardar';
        this.editCargando = false;
      }
    });
  }

  // ── Contraseña ───────────────────────────────────────────
  abrirModalCambiarContrasena(usuario: any, modalContent: TemplateRef<any>): void {
    this.usuarioSeleccionado = usuario;
    this.nuevaContrasena     = '';
    this.confirmarContrasena = '';
    this.modalService.open(modalContent, { centered: true, size: 'md', backdrop: 'static' });
  }

  confirmarCambioContrasena(): void {
    if (this.nuevaContrasena !== this.confirmarContrasena) { alert('Las contraseñas no coinciden'); return; }
    this.mensajeConfirmacion = `¿Cambiar la contraseña de ${this.usuarioSeleccionado.correo}?`;
    this.accionConfirmada    = () => this.cambiarContrasenaReal();
  }

  cambiarContrasenaReal(): void {
    this.usuarioService.cambiarContraseña(this.usuarioSeleccionado.correo, this.nuevaContrasena)
      .subscribe({
        next: () => { alert('Contraseña cambiada correctamente'); this.nuevaContrasena = ''; this.confirmarContrasena = ''; },
        error: (err) => alert('Error: ' + err.message)
      });
  }

  // ── Habilitar / Inhabilitar ──────────────────────────────
  confirmarInhabilitar(usuario: any, modalContent: TemplateRef<any>): void {
    this.usuarioSeleccionado = usuario;
    this.mensajeConfirmacion = `¿Inhabilitar al usuario ${usuario.correo}?`;
    this.accionConfirmada    = () => this.inhabilitarUsuarioReal();
    this.modalService.open(modalContent, { centered: true });
  }

  inhabilitarUsuarioReal(): void {
    this.usuarioService.cambiarEstado(this.usuarioSeleccionado.correo, false).subscribe({
      next: (res) => {
        if (res.verificacion) {
          const i = this.listaActivos.findIndex(u => u.correo === this.usuarioSeleccionado.correo);
          if (i !== -1) { const u = this.listaActivos.splice(i, 1)[0]; u.estado = false; this.listaInactivos.push(u); }
          this.filtrarUsuarios();
          alert(res.mensaje || 'Usuario inhabilitado');
        }
      },
      error: (err) => alert(err.error?.mensaje || 'Error')
    });
  }

  confirmarHabilitar(usuario: any, modalContent: TemplateRef<any>): void {
    this.usuarioSeleccionado = usuario;
    this.mensajeConfirmacion = `¿Habilitar al usuario ${usuario.correo}?`;
    this.accionConfirmada    = () => this.habilitarUsuarioReal();
    this.modalService.open(modalContent, { centered: true });
  }

  habilitarUsuarioReal(): void {
    this.usuarioService.cambiarEstado(this.usuarioSeleccionado.correo, true).subscribe({
      next: (res) => {
        if (res.verificacion) {
          const i = this.listaInactivos.findIndex(u => u.correo === this.usuarioSeleccionado.correo);
          if (i !== -1) { const u = this.listaInactivos.splice(i, 1)[0]; u.estado = true; this.listaActivos.push(u); }
          this.filtrarUsuarios();
          alert(res.mensaje || 'Usuario habilitado');
        }
      },
      error: (err) => alert(err.error?.mensaje || 'Error')
    });
  }
}