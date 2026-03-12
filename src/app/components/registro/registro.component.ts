// registros.component.ts
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RegistrosService } from '../../registros/registros.service';
import { RegistroResumen, RegistroDetalle } from '../../registros/registros'
import { DepartamentosService } from '../../departamentos/departamentos.service'; // ajusta ruta

const POR_PAGINA = 20;

@Component({
  selector: 'app-registros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegistrosComponent implements OnInit, OnDestroy {

  // ── Estado ───────────────────────────────
  todos: RegistroResumen[]       = [];
  filtrados: RegistroResumen[]   = [];
  cargando    = false;
  errorMsg    = '';

  // ── Filtros ──────────────────────────────
  filtroTipo  = '';       // 'entrada' | 'salida' | ''
  filtroFecha = '';       // YYYY-MM-DD

  // ── Pestañas / Paginación ────────────────
  paginaActual  = 1;
  totalPaginas  = 1;
  pestanas: number[] = [];   // [1, 2, 3 ...]
  registrosPagina: RegistroResumen[] = [];

  // ── Modal detalle ────────────────────────
  registroSeleccionado: RegistroResumen | null = null;
  detalle: RegistroDetalle[] = [];
  cargandoDetalle = false;
  modalDetalle    = false;

  // ── Usuario ──────────────────────────────
  plantelUsuario = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private svc: RegistrosService,
    private deptSvc: DepartamentosService
  ) {}

  ngOnInit(): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.plantelUsuario = sesion?.plantel ?? 0;
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga ────────────────────────────────

  cargar(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.svc.VerRegistros(this.plantelUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.todos    = data;
          this.cargando = false;
          this.aplicarFiltros();
        },
        error: (err) => {
          this.errorMsg = err.error?.mensaje || 'Error al cargar registros';
          this.cargando = false;
        }
      });
  }

  // ── Filtros ──────────────────────────────

  aplicarFiltros(): void {
    let resultado = [...this.todos];

    if (this.filtroTipo) {
      resultado = resultado.filter(r => r.tipo === this.filtroTipo);
    }
    if (this.filtroFecha) {
      resultado = resultado.filter(r => r.fecha.startsWith(this.filtroFecha));
    }

    this.filtrados     = resultado;
    this.paginaActual  = 1;
    this.calcularPaginas();
  }

  limpiarFiltros(): void {
    this.filtroTipo  = '';
    this.filtroFecha = '';
    this.aplicarFiltros();
  }

  // ── Paginación / Pestañas ────────────────

  calcularPaginas(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.filtrados.length / POR_PAGINA));
    this.pestanas     = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    this.irAPagina(this.paginaActual > this.totalPaginas ? 1 : this.paginaActual);
  }

  irAPagina(n: number): void {
    this.paginaActual = n;
    const inicio = (n - 1) * POR_PAGINA;
    this.registrosPagina = this.filtrados.slice(inicio, inicio + POR_PAGINA);
  }

  // ── Modal detalle ────────────────────────

  verDetalle(r: RegistroResumen): void {
    this.registroSeleccionado = r;
    this.detalle        = [];
    this.cargandoDetalle = true;
    this.modalDetalle   = true;

    this.svc.VerDetalle(r.id_registro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.detalle         = data;
          this.cargandoDetalle = false;
        },
        error: () => {
          this.cargandoDetalle = false;
          this.errorMsg        = 'Error al cargar detalle';
        }
      });
  }

  cerrarDetalle(): void {
    this.modalDetalle         = false;
    this.registroSeleccionado = null;
    this.detalle              = [];
  }

  // ── Helpers ──────────────────────────────

  getBadgeClass(tipo: string): string {
    return tipo === 'entrada' ? 'badge-entrada' : 'badge-salida';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'entrada' ? '↑ Entrada' : '↓ Salida';
  }
}