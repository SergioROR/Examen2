import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../usuario/usuario.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
declare const bootstrap: any; 

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent {
  terminoBusqueda: string = '';
  listaActivosFiltrada: any[] = [];
  listaInactivosFiltrada: any[] = [];
  listaInactivos: any[] = [];
  listaActivos: any[] = [];
  usuarioSeleccionado: any = null;
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  mensajeConfirmacion: string = '';
  constructor(
    private usuarioService: UsuarioService,
    private modalService: NgbModal
  ){}
  

  accionConfirmada: () => void = () => {};

  abrirModalCambiarContrasena(usuario: any, modalContent: TemplateRef<any>) {
    this.usuarioSeleccionado = usuario;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';

    this.modalService.open(modalContent, { 
      centered: true, 
      size: 'md',
      backdrop: 'static' 
    });
  }

  confirmarCambioContrasena() {
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.mensajeConfirmacion = `¿Estás seguro de cambiar la contraseña del usuario ${this.usuarioSeleccionado.correo}?`;
    this.accionConfirmada = () => this.cambiarContrasenaReal();
    
    const modalCambiar = bootstrap.Modal.getInstance(document.getElementById('modalCambiarContrasena'));
    modalCambiar?.hide();

    const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    modalConfirm.show();
  }

  cambiarContrasenaReal() {
    this.usuarioService.cambiarContraseña(this.usuarioSeleccionado.correo, this.nuevaContrasena)
      .subscribe({
        next: () => {
          alert('Contraseña cambiada correctamente');
          this.nuevaContrasena = '';
          this.confirmarContrasena = '';
        },
        error: (err) => alert('Error al cambiar contraseña: ' + err.message)
      });
  }

  confirmarInhabilitar(usuario: any, modalContent: TemplateRef<any>) {
    this.usuarioSeleccionado = usuario;
    this.mensajeConfirmacion = `¿Estás seguro de inhabilitar al usuario ${usuario.correo}?`;
    this.accionConfirmada = () => this.inhabilitarUsuarioReal();

    this.modalService.open(modalContent, { centered: true });
  }

  inhabilitarUsuarioReal() {
    const correo = this.usuarioSeleccionado.correo;
    const nuevoEstado = false;

    this.usuarioService.cambiarEstado(correo, nuevoEstado).subscribe({
      next: (res) => {
        if (res.verificacion) {
          const index = this.listaActivos.findIndex(u => u.correo === correo);
          if (index !== -1) {
            const usuarioMovido = this.listaActivos.splice(index, 1)[0];
            usuarioMovido.estado = nuevoEstado;
            this.listaInactivos.push(usuarioMovido);
          }
          alert(res.mensaje || 'Usuario inhabilitado correctamente');
        }
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al inhabilitar usuario');
      }
    });
  }

  confirmarHabilitar(usuario: any, modalContent: TemplateRef<any>) {
    this.usuarioSeleccionado = usuario;
    this.mensajeConfirmacion = `¿Estás seguro de habilitar al usuario ${usuario.correo}?`;
    this.accionConfirmada = () => this.habilitarUsuarioReal();

    this.modalService.open(modalContent, { centered: true });
  }

  habilitarUsuarioReal() {
    const correo = this.usuarioSeleccionado.correo;
    const nuevoEstado = true;

    this.usuarioService.cambiarEstado(correo, nuevoEstado).subscribe({
      next: (res) => {
        if (res.verificacion) {
          const index = this.listaInactivos.findIndex(u => u.correo === correo);
          if (index !== -1) {
            const usuarioMovido = this.listaInactivos.splice(index, 1)[0];
            usuarioMovido.estado = nuevoEstado;
            this.listaActivos.push(usuarioMovido);
          }
          alert(res.mensaje || 'Usuario habilitado correctamente');
        }
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al habilitar usuario');
      }
    });
  }

  filtrarUsuarios() {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    this.listaActivosFiltrada = this.listaActivos.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(termino) ||
      usuario.apellidos?.toLowerCase().includes(termino) ||
      usuario.correo?.toLowerCase().includes(termino)
    );

    this.listaInactivosFiltrada = this.listaInactivos.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(termino) ||
      usuario.apellidos?.toLowerCase().includes(termino) ||
      usuario.correo?.toLowerCase().includes(termino)
    );
  }
  
  ngOnInit() {
    this.usuarioService.MostrarUsuarios().subscribe({
      next: (usuarios) => {
        this.listaActivos = usuarios.filter(u => u.estado === true);
        this.listaInactivos = usuarios.filter(u => u.estado === false);
        
        this.listaActivosFiltrada = [...this.listaActivos];
        this.listaInactivosFiltrada = [...this.listaInactivos];
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }
}