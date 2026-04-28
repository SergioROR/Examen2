import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlantelService } from '../../plantel/plantel.service';
import { Plantel, DetallePlantel } from '../../plantel/plantel';

@Component({
  selector: 'app-plantel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './plantel.component.html',
  styleUrls: ['./plantel.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PlantelComponent implements OnInit, OnDestroy {

  listaPlanteles:        Plantel[] = [];
  listaPlantelesFiltrada: Plantel[] = [];
  terminoBusqueda = '';
  cargando        = false;
  errorMsg        = '';
  successMsg      = '';

  // ── Modal detalle ────────────────────────────────────────
  modalDetalle      = false;
  detalle:          DetallePlantel | null = null;
  cargandoDetalle   = false;
  tabActiva:        'inventario' | 'usuarios' = 'inventario';
  hacerPrincipalCargando = false;

  readonly URL_IMG = 'http://localhost:3005/imagenes/';
  readonly URL_AVT = 'http://localhost:3005/imagenes/avatares/';

  private destroy$  = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: PlantelService) {}

  ngOnInit(): void { this.cargarPlanteles(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Carga ────────────────────────────────────────────────

  cargarPlanteles(): void {
    this.cargando = true;
    this.svc.VerPlanteles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Ordenar: principal primero
          this.listaPlanteles = data.sort((a, b) =>
            (b.es_principal ? 1 : 0) - (a.es_principal ? 1 : 0)
          );
          this.listaPlantelesFiltrada = [...this.listaPlanteles];
          this.cargando = false;
        },
        error: () => { this.errorMsg = 'Error al cargar planteles'; this.cargando = false; }
      });
  }

  filtrarPlanteles(): void {
    const t = this.terminoBusqueda.toLowerCase().trim();
    this.listaPlantelesFiltrada = t
      ? this.listaPlanteles.filter(p => p.nombre.toLowerCase().includes(t))
      : [...this.listaPlanteles];
  }

  // ── Modal detalle ────────────────────────────────────────

  verDetalle(p: Plantel): void {
    this.detalle        = null;
    this.cargandoDetalle = true;
    this.tabActiva      = 'inventario';
    this.modalDetalle   = true;
    this.errorMsg       = '';

    this.svc.VerDetalle(p.id_plantel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => { this.detalle = d; this.cargandoDetalle = false; },
        error: ()  => { this.cargandoDetalle = false; this.errorMsg = 'Error al cargar detalle'; }
      });
  }

  cerrarDetalle(): void {
    this.modalDetalle = false;
    this.detalle      = null;
  }

  // ── Hacer principal ──────────────────────────────────────

  hacerPrincipal(id: number): void {
    this.hacerPrincipalCargando = true;
    this.svc.HacerPrincipal(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.hacerPrincipalCargando = false;
          this.cerrarDetalle();
          this.toast(res.mensaje);
          this.cargarPlanteles();
        },
        error: () => {
          this.hacerPrincipalCargando = false;
          this.errorMsg = 'Error al cambiar plantel principal';
        }
      });
  }

  // ── UI ───────────────────────────────────────────────────

  getStockClass(cantidad: number): string {
    if (cantidad === 0) return 'stock-empty';
    if (cantidad <= 5)  return 'stock-low';
    if (cantidad <= 15) return 'stock-mid';
    return 'stock-ok';
  }

  toast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.successMsg = msg;
    this.toastTimer = setTimeout(() => this.successMsg = '', 3500);
  }
}