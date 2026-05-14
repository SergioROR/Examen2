import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DepartamentosService } from '../../departamentos/departamentos.service';
import { Departamento } from '../../departamentos/departamentos';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DepartamentosComponent implements OnInit, OnDestroy {

  departamentos: Departamento[] = [];
  cargando      = false;
  errorMsg      = '';
  successMsg    = '';

  // ── Formulario ───────────────────────────────────────────
  modalForm     = false;
  formCargando  = false;
  nombre        = '';
  descripcion   = '';

  // ── Eliminar ─────────────────────────────────────────────
  modalEliminar              = false;
  deptSeleccionado: Departamento | null = null;
  eliminandoCargando         = false;

  plantel   = 0;
  idUsuario = 0;

  private destroy$  = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private deptSvc:     DepartamentosService
  ) {}

  ngOnInit(): void {
    const sesion   = this.deptSvc.getUsuarioSesion();
    this.plantel   = sesion?.id_plantel ?? 0;
    this.idUsuario = sesion?.id_usuario ?? 0;
    this.cargarDepartamentos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Carga ────────────────────────────────────────────────

  cargarDepartamentos(): void {
    this.cargando = true;
    this.deptSvc.VerDepartamentosPorPlantel(this.plantel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.departamentos = data; this.cargando = false; },
        error: ()    => { this.errorMsg = 'Error al cargar departamentos'; this.cargando = false; }
      });
  }

  // ── Crear ────────────────────────────────────────────────

  abrirForm(): void {
    this.nombre      = '';
    this.descripcion = '';
    this.errorMsg    = '';
    this.modalForm   = true;
  }

  cerrarForm(): void {
    this.modalForm    = false;
    this.errorMsg     = '';
    this.formCargando = false;
  }

  guardar(): void {
    if (!this.nombre.trim())      { this.errorMsg = 'El nombre es obligatorio';      return; }
    if (!this.descripcion.trim()) { this.errorMsg = 'La descripción es obligatoria'; return; }

    this.formCargando = true;
    this.errorMsg     = '';

    this.deptSvc.CrearDepartamento(this.nombre, this.descripcion, this.plantel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.formCargando = false;
          this.cerrarForm();
          this.toast(res.mensaje);
          this.cargarDepartamentos();
        },
        error: (err) => {
          this.errorMsg     = err.error?.mensaje || 'Error al crear departamento';
          this.formCargando = false;
        }
      });
  }

  // ── Eliminar ─────────────────────────────────────────────

  abrirEliminar(d: Departamento): void {
    this.deptSeleccionado = d;
    this.modalEliminar    = true;
    this.errorMsg         = '';
  }

  cerrarEliminar(): void {
    this.modalEliminar    = false;
    this.deptSeleccionado = null;
    this.errorMsg         = '';
  }

  confirmarEliminar(): void {
    if (!this.deptSeleccionado) return;
    this.eliminandoCargando = true;

    this.deptSvc.EliminarDepartamento(this.deptSeleccionado.id_departamento)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.eliminandoCargando = false;
          this.cerrarEliminar();
          this.toast(res.mensaje);
          this.cargarDepartamentos();
        },
        error: (err) => {
          this.errorMsg           = err.error?.mensaje || 'Error al eliminar';
          this.eliminandoCargando = false;
        }
      });
  }

  // ── UI ───────────────────────────────────────────────────

  toast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.successMsg = msg;
    this.toastTimer = setTimeout(() => this.successMsg = '', 3500);
  }

  get nombrePlantel(): string {
    return this.deptSvc.getUsuarioSesion()?.nombre ?? '';
  }
}