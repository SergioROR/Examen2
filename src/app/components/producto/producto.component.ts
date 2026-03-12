import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductosService } from '../../productos/productos.service';
import { DepartamentosService } from '../../departamentos/departamentos.service';
import { Plantel, Departamento } from '../../departamentos/departamentos';
import { RegistrosService } from '../../registros/registros.service';
import {
  Producto,
  ProductoUpsert,
  ProductoEditar,
  ActualizarCantidad,
  RespuestaUpsert,
  RespuestaGeneral
} from '../../productos/productos';

@Pipe({ name: 'stockFilter', standalone: true })
export class StockFilterPipe implements PipeTransform {
  transform(productos: Producto[], min: number, max: number): number {
    return productos.filter(p => p.cantidad >= min && p.cantidad <= max).length;
  }
}

type ModalMode = 'crear' | 'editar' | 'cantidad' | 'eliminar' | null;

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, StockFilterPipe],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProductoComponent implements OnInit, OnDestroy {

  // ── Estado ───────────────────────────────
  productos: Producto[]          = [];
  productosFiltrados: Producto[] = [];
  cargando      = false;
  errorMsg      = '';
  successMsg    = '';
  busqueda      = '';

  // ── Plantel / Departamento ───────────────
  planteles: Plantel[]          = [];
  departamentos: Departamento[] = [];
  plantelUsuario = 0;

  // ── Modal ────────────────────────────────
  modalMode: ModalMode          = null;
  modalCargando                 = false;
  productoSeleccionado: Producto | null = null;

  // ── Formularios ──────────────────────────
  formCrear: ProductoUpsert = this.crearFormVacio();
  formEditar: ProductoEditar = { id_productos: 0 };
  formCantidad: ActualizarCantidad = {
    id_productos: 0, operacion: 'agregar', cantidad: 1
  };

  // ── Internos ─────────────────────────────
  private destroy$  = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private svc: ProductosService,
    private deptSvc: DepartamentosService,
    private regSvc: RegistrosService        // <-- agregado aquí
  ) {}

  ngOnInit(): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.plantelUsuario = sesion?.plantel ?? 0;
    this.cargarPlanteles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Helpers privados ─────────────────────

  private crearFormVacio(): ProductoUpsert {
    return {
      nombre: '', num_serie: '', cantidad: 1,
      id_plantel: 0, id_departamento: 0,
      descripcion: '', modelo: ''
    };
  }

  private generarRegistro(
    tipo: 'entrada' | 'salida',
    nota: string,
    id_departamento: number,
    id_plantel: number,
    productos: { id_productos: number; cantidad: number }[]
  ): void {
    const sesion = this.deptSvc.getUsuarioSesion();
    this.regSvc.CrearRegistro({
      tipo, nota, id_departamento, id_plantel,
      id_usuario: sesion?.id_usuario ?? 0,
      productos
    }).pipe(takeUntil(this.destroy$)).subscribe();
  }

  // ── Carga ────────────────────────────────

  cargarProductos(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.svc.VerProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const nombrePlantel = this.planteles.find(pl => pl.id_plantel === this.plantelUsuario)?.nombre;
          this.productos = (this.plantelUsuario && nombrePlantel)
            ? data.filter(p => p.plantel === nombrePlantel)
            : data;
          this.productosFiltrados = this.productos;
          this.cargando = false;
          if (this.busqueda.trim()) this.filtrar();
        },
        error: (err) => {
          this.errorMsg = err.error?.mensaje || 'Error al cargar productos';
          this.cargando = false;
        }
      });
  }

  cargarPlanteles(): void {
    this.deptSvc.VerPlanteles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.planteles = data; this.cargarProductos(); },
        error: () => this.cargarProductos()
      });
  }

  cargarDepartamentos(id_plantel: number, nombreDeptActual?: string): void {
    this.departamentos = [];
    if (!id_plantel) return;
    this.deptSvc.VerDepartamentosPorPlantel(id_plantel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.departamentos = data;
          if (nombreDeptActual) {
            const found = data.find(d => d.nombre === nombreDeptActual);
            if (found) this.formEditar.id_departamento = found.id_departamento;
          }
        },
        error: () => this.errorMsg = 'Error al cargar departamentos'
      });
  }

  // ── Búsqueda ─────────────────────────────

  filtrar(): void {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) { this.productosFiltrados = this.productos; return; }
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(q)    ||
      p.num_serie.toLowerCase().includes(q) ||
      (p.modelo?.toLowerCase().includes(q) ?? false)
    );
  }

  // ── Abrir modales ────────────────────────

  abrirCrear(): void {
    this.errorMsg      = '';
    this.departamentos = [];
    this.formCrear     = this.crearFormVacio();
    this.formCrear.id_plantel = this.plantelUsuario;
    if (this.plantelUsuario) this.cargarDepartamentos(this.plantelUsuario);
    this.modalMode = 'crear';
  }

  abrirEditar(p: Producto): void {
    this.errorMsg             = '';
    this.departamentos        = [];
    this.productoSeleccionado = p;
    const plantelEncontrado   = this.planteles.find(pl => pl.nombre === p.plantel);
    const idPlantel           = plantelEncontrado?.id_plantel ?? this.plantelUsuario;
    this.formEditar = {
      id_productos:    p.id_productos,
      nombre:          p.nombre,
      descripcion:     p.descripcion,
      modelo:          p.modelo,
      cantidad:        p.cantidad,
      num_serie:       p.num_serie,
      id_plantel:      idPlantel,
      id_departamento: 0
    };
    if (idPlantel) this.cargarDepartamentos(idPlantel, p.departamento);
    this.modalMode = 'editar';
  }

  abrirCantidad(p: Producto): void {
    this.errorMsg             = '';
    this.productoSeleccionado = p;
    this.formCantidad         = { id_productos: p.id_productos, operacion: 'agregar', cantidad: 1 };
    this.modalMode            = 'cantidad';
  }

  abrirEliminar(p: Producto): void {
    this.errorMsg             = '';
    this.productoSeleccionado = p;
    this.modalMode            = 'eliminar';
  }

  cerrarModal(): void {
    this.modalMode            = null;
    this.productoSeleccionado = null;
    this.errorMsg             = '';
    this.modalCargando        = false;
    this.departamentos        = [];
  }

  // ── Acciones ─────────────────────────────

  guardarCrear(): void {
    if (!this.validarCrear()) return;
    this.modalCargando = true;
    this.svc.CrearProducto(this.formCrear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: RespuestaUpsert) => {
          this.generarRegistro(
            'entrada',
            `Alta de producto: ${this.formCrear.nombre}`,
            this.formCrear.id_departamento,
            this.formCrear.id_plantel,
            [{ id_productos: res.producto.id_productos, cantidad: this.formCrear.cantidad }]
          );
          this.modalCargando = false;
          this.cerrarModal();
          this.toast(res.mensaje);
          this.cargarProductos();
        },
        error: (err) => {
          this.errorMsg      = err.error?.mensaje || 'Error al guardar';
          this.modalCargando = false;
        }
      });
  }

  guardarEditar(): void {
    this.modalCargando = true;
    this.svc.EditarProducto(this.formEditar)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: RespuestaGeneral) => {
          this.modalCargando = false;
          this.cerrarModal();
          this.toast(res.mensaje);
          this.cargarProductos();
        },
        error: (err) => {
          this.errorMsg      = err.error?.mensaje || 'Error al editar';
          this.modalCargando = false;
        }
      });
  }

  guardarCantidad(): void {
    if (this.formCantidad.cantidad < 1) {
      this.errorMsg = 'La cantidad debe ser mayor a 0'; return;
    }
    this.modalCargando = true;
    this.svc.ActualizarCantidad(this.formCantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: RespuestaGeneral) => {
          const p    = this.productoSeleccionado!;
          const dept = this.departamentos.find(d => d.nombre === p.departamento);
          this.generarRegistro(
            this.formCantidad.operacion === 'agregar' ? 'entrada' : 'salida',
            `Ajuste de existencias: ${p.nombre}`,
            dept?.id_departamento ?? 0,
            this.plantelUsuario,
            [{ id_productos: p.id_productos, cantidad: this.formCantidad.cantidad }]
          );
          this.modalCargando = false;
          this.cerrarModal();
          this.toast(res.mensaje);
          this.cargarProductos();
        },
        error: (err) => {
          this.errorMsg      = err.error?.mensaje || 'Error al actualizar cantidad';
          this.modalCargando = false;
        }
      });
  }

  confirmarEliminar(): void {
    if (!this.productoSeleccionado) return;
    this.modalCargando = true;
    const p    = this.productoSeleccionado;
    const dept = this.departamentos.find(d => d.nombre === p.departamento);
    this.svc.EliminarProducto(p.id_productos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: RespuestaGeneral) => {
          this.generarRegistro(
            'salida',
            `Baja de producto: ${p.nombre}`,
            dept?.id_departamento ?? 0,
            this.plantelUsuario,
            [{ id_productos: p.id_productos, cantidad: p.cantidad }]
          );
          this.modalCargando = false;
          this.cerrarModal();
          this.toast(res.mensaje);
          this.cargarProductos();
        },
        error: (err) => {
          this.errorMsg      = err.error?.mensaje || 'Error al eliminar';
          this.modalCargando = false;
        }
      });
  }

  // ── Validación ───────────────────────────

  private validarCrear(): boolean {
    if (!this.formCrear.nombre.trim()) {
      this.errorMsg = 'El nombre es obligatorio'; return false;
    }
    if (!this.formCrear.num_serie.trim()) {
      this.errorMsg = 'El número de serie es obligatorio'; return false;
    }
    if (this.formCrear.cantidad < 1) {
      this.errorMsg = 'La cantidad debe ser al menos 1'; return false;
    }
    if (!this.formCrear.id_plantel || this.formCrear.id_plantel < 1) {
      this.errorMsg = 'Debes seleccionar un plantel'; return false;
    }
    if (!this.formCrear.id_departamento || this.formCrear.id_departamento < 1) {
      this.errorMsg = 'Debes seleccionar un departamento'; return false;
    }
    return true;
  }

  // ── UI helpers ───────────────────────────

  toast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.successMsg = msg;
    this.toastTimer = setTimeout(() => this.successMsg = '', 3500);
  }

  getStockClass(cantidad: number): string {
    if (cantidad === 0) return 'stock-empty';
    if (cantidad <= 5)  return 'stock-low';
    if (cantidad <= 15) return 'stock-mid';
    return 'stock-ok';
  }

  trackById(_: number, p: Producto): number {
    return p.id_productos;
  }
}