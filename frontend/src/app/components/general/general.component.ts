import {
  Component, OnInit, OnDestroy, ViewEncapsulation,
  AfterViewInit, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

import { DepartamentosService } from '../../departamentos/departamentos.service';
import { PedidosService } from '../../pedidos/pedidos.service';
import { GeneralService } from '../../general/general.service';
import {
  StatsAdmin, StatsUsuario, PedidoPorPlantel, PedidoResumen, ProductoSolicitado
} from '../../general/general';
import { DetallePedido } from '../../pedidos/pedidos';

Chart.register(...registerables);

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GeneralComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('chartPastel') chartPastelRef!: ElementRef;
  @ViewChild('chartProductos') chartProductosRef!: ElementRef;

  // ── Sesión ───────────────────────────────────────────────
  rol = '';
  plantel = 0;
  idUsuario = 0;
  nombre = '';

  // ── Estado ───────────────────────────────────────────────
  cargando = true;
  errorMsg = '';
  successMsg = '';
  accionCargando = false;

  // ── Admin ────────────────────────────────────────────────
  statsAdmin: StatsAdmin = {
    entradas: 0, salidas: 0, stockTotal: 0,
    stockBajo: 0, pedidosPendientes: 0, solicitudesPendientes: 0
  };
  pedidosPorPlantel: PedidoPorPlantel[] = [];
  pedidosRecientes: PedidoResumen[] = [];
  // Agrega esta propiedad junto a las demás
  productosMasSolicitados: ProductoSolicitado[] = [];

  // ── Usuario ──────────────────────────────────────────────
  statsUsuario: StatsUsuario = {
    misPedidos: 0, pedidosEntregados: 0, pedidosPendientes: 0,
    solicitudesPendientes: 0, productosDisponibles: 0
  };
  misPedidosRecientes: PedidoResumen[] = [];

  // ── Modal detalle ────────────────────────────────────────
  modalDetalle = false;
  pedidoSeleccionado: PedidoResumen | null = null;
  detallePedido: DetallePedido[] = [];
  cargandoDetalle = false;

  private chartPastel: Chart | null = null;
  private chartProductos: Chart | null = null;
  private destroy$ = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private deptSvc: DepartamentosService,
    private pedidosSvc: PedidosService,
    private generalSvc: GeneralService
  ) { }

  ngOnInit(): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.rol = sesion?.rol ?? '';
    this.plantel = sesion?.id_plantel ?? 0;
    this.idUsuario = sesion?.id_usuario ?? 0;
    this.nombre = sesion?.nombre ?? '';
    this.cargarDatos();
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chartPastel?.destroy();
    this.chartProductos?.destroy();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Carga ────────────────────────────────────────────────

  cargarDatos(): void {
    this.cargando = true;
    if (this.esAdmin) {
      this.generalSvc.GetDatosAdmin()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.statsAdmin = {
              entradas: data.entradas,
              salidas: data.salidas,
              stockTotal: data.stockTotal,
              stockBajo: data.stockBajo,
              pedidosPendientes: data.pedidosPendientes,
              solicitudesPendientes: data.solicitudesPendientes
            };
            this.pedidosPorPlantel = data.pedidosPorPlantel;
            this.pedidosRecientes = data.pedidosRecientes;
            this.cargando = false;
            this.productosMasSolicitados = data.productosMasSolicitados;
            setTimeout(() => this.inicializarGraficas(), 150);
          },
          error: () => this.cargando = false
        });
    } else {
      this.generalSvc.GetDatosUsuario(this.plantel)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.statsUsuario = {
              misPedidos: data.misPedidos,
              pedidosEntregados: data.pedidosEntregados,
              pedidosPendientes: data.pedidosPendientes,
              solicitudesPendientes: data.solicitudesPendientes,
              productosDisponibles: data.productosDisponibles
            };
            this.misPedidosRecientes = data.pedidosRecientes;
            this.cargando = false;
          },
          error: () => this.cargando = false
        });
    }
  }

  // ── Gráficas ─────────────────────────────────────────────

  inicializarGraficas(): void {
    this.inicializarPastel();
    this.inicializarProductos();
  }

  inicializarPastel(): void {
    const canvas = this.chartPastelRef?.nativeElement;
    if (!canvas || !this.pedidosPorPlantel.length) return;
    this.chartPastel?.destroy();

    const colores = [
      '#1a3668', '#c9a84c', '#2c5f8a', '#e8d08a',
      '#0d1b35', '#8a6f32', '#4a7fb5', '#f0d898'
    ];

    this.chartPastel = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.pedidosPorPlantel.map(p => p.plantel),
        datasets: [{
          data: this.pedidosPorPlantel.map(p => p.total),
          backgroundColor: colores.slice(0, this.pedidosPorPlantel.length),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 14,
              font: { family: 'DM Sans', size: 11 },
              color: '#4a4535'
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} pedidos`
            }
          }
        }
      }
    });
  }

  inicializarProductos(): void {
    const canvas = this.chartProductosRef?.nativeElement;
    if (!canvas || !this.productosMasSolicitados.length) return;
    this.chartProductos?.destroy();

    this.chartProductos = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.productosMasSolicitados.map(p => p.producto),
        datasets: [{
          label: 'Unidades solicitadas',
          data: this.productosMasSolicitados.map(p => p.total),
          backgroundColor: this.productosMasSolicitados.map((_, i) =>
            i === 0 ? '#c9a84c' : 'rgba(26,54,104,0.75)'
          ),
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: '#1a3668'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw} unidades solicitadas`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'DM Sans', size: 10 },
              color: '#4a4535',
              maxRotation: 35
            }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'DM Sans', size: 11 }, color: '#4a4535' },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }
  // ── Detalle y acciones ───────────────────────────────────

  verDetalle(p: PedidoResumen): void {
    this.pedidoSeleccionado = p;
    this.detallePedido = [];
    this.cargandoDetalle = true;
    this.modalDetalle = true;
    this.errorMsg = '';

    this.pedidosSvc.VerDetalle(p.id_pedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => { this.detallePedido = d; this.cargandoDetalle = false; },
        error: () => { this.cargandoDetalle = false; }
      });
  }

  cerrarDetalle(): void {
    this.modalDetalle = false;
    this.pedidoSeleccionado = null;
    this.detallePedido = [];
    this.errorMsg = '';
  }

  cambiarEstado(estado: string): void {
    if (!this.pedidoSeleccionado) return;
    this.accionCargando = true;
    this.errorMsg = '';

    this.pedidosSvc.CambiarEstado(
      this.pedidoSeleccionado.id_pedido,
      estado,
      this.idUsuario,
      this.plantel
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.accionCargando = false;
          this.cerrarDetalle();
          this.toast(res.mensaje);
          this.cargarDatos();
        },
        error: (err) => {
          this.errorMsg = err.error?.mensaje || 'Error al actualizar';
          this.accionCargando = false;
        }
      });
  }

  // ── UI helpers ───────────────────────────────────────────

  get esAdmin(): boolean { return this.rol === 'Admin'; }

  get mesActual(): string {
    return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  toast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.successMsg = msg;
    this.toastTimer = setTimeout(() => this.successMsg = '', 3500);
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-pendiente', aceptado: 'badge-aceptado',
      en_camino: 'badge-camino', entregado: 'badge-entregado',
      rechazado: 'badge-rechazado'
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