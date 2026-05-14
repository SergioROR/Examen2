import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RegistrosService } from '../../registros/registros.service';
import { RegistroResumen, RegistroDetalle } from '../../registros/registros';
import { DepartamentosService } from '../../departamentos/departamentos.service';

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

  todos: RegistroResumen[]     = [];
  filtrados: RegistroResumen[] = [];
  cargando    = false;
  errorMsg    = '';

  filtroTipo  = '';
  filtroFecha = '';

  paginaActual = 1;
  totalPaginas = 1;
  pestanas: number[] = [];
  registrosPagina: RegistroResumen[] = [];

  // Modal detalle
  registroSeleccionado: RegistroResumen | null = null;
  detalle: RegistroDetalle[] = [];
  cargandoDetalle = false;
  modalDetalle    = false;

  plantelUsuario = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private svc: RegistrosService,
    private deptSvc: DepartamentosService
  ) {}

  ngOnInit(): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.plantelUsuario = sesion?.id_plantel ?? 0;
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  aplicarFiltros(): void {
    let r = [...this.todos];
    if (this.filtroTipo)  r = r.filter(x => x.tipo === this.filtroTipo);
    if (this.filtroFecha) r = r.filter(x => x.fecha.startsWith(this.filtroFecha));
    this.filtrados    = r;
    this.paginaActual = 1;
    this.calcularPaginas();
  }

  limpiarFiltros(): void {
    this.filtroTipo = ''; this.filtroFecha = '';
    this.aplicarFiltros();
  }

  calcularPaginas(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.filtrados.length / POR_PAGINA));
    this.pestanas     = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    this.irAPagina(this.paginaActual > this.totalPaginas ? 1 : this.paginaActual);
  }

  irAPagina(n: number): void {
    this.paginaActual    = n;
    const inicio         = (n - 1) * POR_PAGINA;
    this.registrosPagina = this.filtrados.slice(inicio, inicio + POR_PAGINA);
  }

  verDetalle(r: RegistroResumen): void {
    this.registroSeleccionado = r;
    this.detalle         = [];
    this.cargandoDetalle = true;
    this.modalDetalle    = true;

    this.svc.VerDetalle(r.fecha, r.tipo, this.plantelUsuario, r.id_departamento)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.detalle = data; this.cargandoDetalle = false; },
        error: ()    => { this.cargandoDetalle = false; this.errorMsg = 'Error al cargar detalle'; }
      });
  }

  cerrarDetalle(): void {
    this.modalDetalle         = false;
    this.registroSeleccionado = null;
    this.detalle              = [];
  }

  getBadgeClass(tipo: string): string {
    return tipo === 'entrada' ? 'badge-entrada' : 'badge-salida';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'entrada' ? '↑ Entrada' : '↓ Salida';
  }

  // Agrupar detalle por hora/movimiento para mostrar bien en el modal
  get detalleAgrupado(): { hora: string; nota: string; usuario: string; productos: RegistroDetalle[] }[] {
    const grupos: Map<string, { hora: string; nota: string; usuario: string; productos: RegistroDetalle[] }> = new Map();
    for (const d of this.detalle) {
      const key = `${d.hora}-${d.usuario}`;
      if (!grupos.has(key)) {
        grupos.set(key, { hora: d.hora, nota: d.nota, usuario: d.usuario, productos: [] });
      }
      grupos.get(key)!.productos.push(d);
    }
    return Array.from(grupos.values());
  }
}