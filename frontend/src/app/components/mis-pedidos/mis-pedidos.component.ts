// mis-pedidos.component.ts
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PedidosService } from '../../pedidos/pedidos.service';
import { ProductosService } from '../../productos/productos.service';
import { DepartamentosService } from '../../departamentos/departamentos.service';
import { Pedido, DetallePedido } from '../../pedidos/pedidos';
import { Producto } from '../../productos/productos';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MisPedidosComponent implements OnInit, OnDestroy {

  // ── Mis pedidos ──────────────────────────────────────────
  pedidos: Pedido[] = [];
  cargando = false;
  errorMsg = '';
  successMsg = '';
  solicitudModelo = '';
  solicitudCantidad = 1;

  // ── Modal nuevo pedido ───────────────────────────────────
  modalNuevo = false;
  modalCargando = false;
  descripcionPedido = '';
  busquedaProducto = '';
  catalogoFiltrado: Producto[] = [];
  catalogo: Producto[] = [];
  itemsPedido: { producto: Producto; cantidad: number }[] = [];

  // ── Modal solicitud ──────────────────────────────────────
  modalSolicitud = false;
  solicitudNombre = '';
  solicitudDesc = '';

  // ── Modal detalle ────────────────────────────────────────
  modalDetalle = false;
  pedidoSeleccionado: Pedido | null = null;
  detalle: DetallePedido[] = [];
  cargandoDetalle = false;

  entregaEnProceso = false;
  plantelUsuario = 0;
  idUsuario = 0;
  private destroy$ = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private svc: PedidosService,
    private prodSvc: ProductosService,
    private deptSvc: DepartamentosService
  ) { }

  ngOnInit(): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.plantelUsuario = sesion?.id_plantel ?? 0;
    this.idUsuario = sesion?.id_usuario ?? 0;
    this.cargarPedidos();
    this.cargarCatalogo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Carga ────────────────────────────────────────────────

  cargarPedidos(): void {
    this.cargando = true;
    this.svc.VerMisPedidos(this.plantelUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.pedidos = data; this.cargando = false; },
        error: () => { this.errorMsg = 'Error al cargar pedidos'; this.cargando = false; }
      });
  }

  cargarCatalogo(): void {
    this.prodSvc.VerProductosPrincipal() // ✅ solo productos del plantel principal
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.catalogo = data,
        error: () => { }
      });
  }

  // ── Nuevo pedido ─────────────────────────────────────────

  abrirNuevo(): void {
    this.modalNuevo = true;
    this.itemsPedido = [];
    this.busquedaProducto = '';
    this.catalogoFiltrado = [];
    this.descripcionPedido = '';
    this.errorMsg = '';
  }

  cerrarNuevo(): void {
    this.modalNuevo = false;
    this.itemsPedido = [];
    this.errorMsg = '';
    this.modalCargando = false;
  }

  filtrarCatalogo(): void {
    const q = this.busquedaProducto.toLowerCase().trim();
    if (!q) { this.catalogoFiltrado = []; return; }
    const yaAgregados = new Set(this.itemsPedido.map(i => i.producto.id_productos));
    this.catalogoFiltrado = this.catalogo.filter(p =>
      !yaAgregados.has(p.id_productos) &&
      (p.nombre.toLowerCase().includes(q) ||
        p.num_serie.toLowerCase().includes(q) ||
        (p.modelo?.toLowerCase().includes(q) ?? false))
    );
  }

  agregarItem(p: Producto): void {
    this.itemsPedido.push({ producto: p, cantidad: 1 });
    this.busquedaProducto = '';
    this.catalogoFiltrado = [];
  }

  quitarItem(i: number): void { this.itemsPedido.splice(i, 1); }

  confirmarPedido(): void {
    if (!this.itemsPedido.length) { this.errorMsg = 'Agrega al menos un producto'; return; }
    for (const item of this.itemsPedido) {
      if (item.cantidad < 1) { this.errorMsg = `Cantidad inválida en ${item.producto.nombre}`; return; }
    }
    this.modalCargando = true;
    this.svc.CrearPedido({
      descripcion: this.descripcionPedido || undefined,
      id_plantel: this.plantelUsuario,
      id_usuario: this.idUsuario,
      productos: this.itemsPedido.map(i => ({ id_productos: i.producto.id_productos, cantidad: i.cantidad }))
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalCargando = false;
        this.cerrarNuevo();
        this.toast('Pedido enviado correctamente');
        this.cargarPedidos();
      },
      error: (err) => { this.errorMsg = err.error?.mensaje || 'Error al enviar pedido'; this.modalCargando = false; }
    });
  }

  // ── Solicitud de producto nuevo ──────────────────────────

  abrirSolicitud(): void {
    this.modalSolicitud = true;
    this.solicitudNombre = '';
    this.solicitudDesc = '';
    this.solicitudModelo = '';   // ✅
    this.solicitudCantidad = 1; // ✅
    this.errorMsg = '';
  }


  cerrarSolicitud(): void { this.modalSolicitud = false; this.errorMsg = ''; }

  enviarSolicitud(): void {
    if (!this.solicitudNombre.trim()) { this.errorMsg = 'El nombre es obligatorio'; return; }
    this.modalCargando = true;
    this.svc.CrearSolicitud({
      nombre: this.solicitudNombre,
      descripcion: this.solicitudDesc || undefined,
      modelo: this.solicitudModelo || undefined,  // ✅
      cantidad: this.solicitudCantidad,              // ✅
      id_usuario: this.idUsuario,
      id_plantel: this.plantelUsuario
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.modalCargando = false; this.cerrarSolicitud(); this.toast('Solicitud enviada'); },
      error: (err) => { this.errorMsg = err.error?.mensaje || 'Error al enviar'; this.modalCargando = false; }
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
        next: (data) => { this.detalle = data; this.cargandoDetalle = false; },
        error: () => { this.cargandoDetalle = false; }
      });
  }

  cerrarDetalle(): void { this.modalDetalle = false; this.pedidoSeleccionado = null; this.detalle = []; }

  confirmarEntrega(id_pedido: number): void {
    if (this.entregaEnProceso) return;
    this.entregaEnProceso = true;

    const sesion = this.deptSvc.getUsuarioSesion();
    this.svc.ConfirmarEntrega(
      id_pedido,
      sesion?.id_usuario ?? 0 // 👈 solo el usuario
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.entregaEnProceso = false;
          this.toast(res.mensaje);
          this.cargarPedidos();
        },
        error: (err) => {
          this.entregaEnProceso = false;
          this.errorMsg = err.error?.mensaje || 'Error al confirmar entrega';
        }
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
      pendiente: 'estado-pendiente', aceptado: 'estado-aceptado',
      en_camino: 'estado-camino', entregado: 'estado-entregado',
      rechazado: 'estado-rechazado'
    };
    return map[estado] ?? '';
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: '⏳ Pendiente', aceptado: '✅ Aceptado',
      en_camino: '🚚 En camino', entregado: '📦 Entregado',
      rechazado: '❌ Rechazado'
    };
    return map[estado] ?? estado;
  }
}