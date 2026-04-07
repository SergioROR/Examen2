import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PedidosService } from '../../pedidos/pedidos.service';
import { DepartamentosService } from '../../departamentos/departamentos.service';
import { Pedido, DetallePedido, SolicitudProducto } from '../../pedidos/pedidos';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminPedidosComponent implements OnInit, OnDestroy {

  // ── Pestañas ─────────────────────────────────────────────
  tabActiva: 'pendientes' | 'aceptados' | 'solicitudes' = 'pendientes';

  // ── Datos ────────────────────────────────────────────────
  pendientes: Pedido[] = [];
  aceptados: Pedido[] = [];
  solicitudes: SolicitudProducto[] = [];
  cargando = false;
  errorMsg = '';
  successMsg = '';

  // ── Modal detalle ────────────────────────────────────────
  modalDetalle = false;
  pedidoSeleccionado: Pedido | null = null;
  detalle: DetallePedido[] = [];
  cargandoDetalle = false;
  accionCargando = false;

  // ── Admin ─────────────────────────────────────────────────
  idAdmin = 0;
  idPlantelAdmin = 0; // ✅ plantel del admin para transferencia

  private destroy$ = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private svc: PedidosService,
    private deptSvc: DepartamentosService
  ) { }

  ngOnInit(): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.idAdmin = sesion?.id_usuario ?? 0;
    this.idPlantelAdmin = sesion?.plantel ?? 0;
    console.log('sesion:', sesion);
    console.log('idAdmin:', this.idAdmin);
    console.log('idPlantelAdmin:', this.idPlantelAdmin); // 👈 necesito ver este valor
    this.cargarTodo();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  cargarTodo(): void {
    this.cargando = true;
    this.svc.VerPendientes().pipe(takeUntil(this.destroy$))
      .subscribe({ next: (d) => this.pendientes = d, error: () => { } });
    this.svc.VerAceptados().pipe(takeUntil(this.destroy$))
      .subscribe({ next: (d) => this.aceptados = d, error: () => { } });
    this.svc.VerSolicitudes().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => { this.solicitudes = d; this.cargando = false; },
        error: () => this.cargando = false
      });
  }

  // ── Detalle ──────────────────────────────────────────────

  verDetalle(p: Pedido): void {
    this.pedidoSeleccionado = p;
    this.detalle = [];
    this.cargandoDetalle = true;
    this.modalDetalle = true;
    this.svc.VerDetalle(p.id_pedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => { this.detalle = d; this.cargandoDetalle = false; },
        error: () => this.cargandoDetalle = false
      });
  }

  cerrarDetalle(): void {
    this.modalDetalle = false;
    this.pedidoSeleccionado = null;
    this.detalle = [];
  }

  // ── Acciones sobre pedidos ───────────────────────────────

  cambiarEstado(estado: string): void {
    if (!this.pedidoSeleccionado) return;

    if (estado === 'en_camino' && !this.stockSuficiente()) {
      this.errorMsg = 'No hay stock suficiente para enviar este pedido';
      return;
    }

    this.accionCargando = true;
    this.errorMsg = '';

    console.log('Body que se envía al backend:', { // 👈 necesito ver este valor
      id_pedido: this.pedidoSeleccionado.id_pedido,
      estado,
      id_usuario_admin: this.idAdmin,
      id_plantel_admin: this.idPlantelAdmin
    });

    this.svc.CambiarEstado(
      this.pedidoSeleccionado.id_pedido,
      estado,
      this.idAdmin,
      this.idPlantelAdmin
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.accionCargando = false;
          this.cerrarDetalle();
          this.toast(res.mensaje);
          this.cargarTodo();
        },
        error: (err) => {
          this.errorMsg = err.error?.mensaje || 'Error al actualizar pedido';
          this.accionCargando = false;
        }
      });
  }

  // ── Solicitudes ──────────────────────────────────────────

  atenderSolicitud(id: number, estado: string): void {
    this.svc.ActualizarSolicitud(id, estado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.toast('Solicitud actualizada'); this.cargarTodo(); },
        error: () => this.errorMsg = 'Error al actualizar solicitud'
      });
  }

  // ── UI ───────────────────────────────────────────────────

  toast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.successMsg = msg;
    this.toastTimer = setTimeout(() => this.successMsg = '', 3500);
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'estado-pendiente',
      aceptado: 'estado-aceptado',
      en_camino: 'estado-camino',
      entregado: 'estado-entregado',
      rechazado: 'estado-rechazado'
    };
    return map[estado] ?? '';
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: '⏳ Pendiente',
      aceptado: '✅ Aceptado',
      en_camino: '🚚 En camino',
      entregado: '📦 Entregado',
      rechazado: '❌ Rechazado'
    };
    return map[estado] ?? estado;
  }

  stockSuficiente(): boolean {
    return this.detalle.every(d => d.stock_actual >= d.cantidad);
  }
}