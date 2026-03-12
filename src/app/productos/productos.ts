
export interface Producto {
  id_productos:    number;
  nombre:          string;
  descripcion:     string;
  modelo:          string;
  cantidad:        number;
  num_serie:       string;
  plantel:         string;
  departamento:    string;
  creacion:        string;
  actualizacion:   string;
}


export interface ProductoUpsert {
  nombre:          string;
  num_serie:       string;
  cantidad:        number;
  id_plantel:      number;
  id_departamento: number;
  descripcion?:    string;
  modelo?:         string;
}

export interface ProductoEditar {
  id_productos:     number;
  nombre?:          string;
  descripcion?:     string;
  modelo?:          string;
  cantidad?:        number;
  num_serie?:       string;
  id_plantel?:      number;
  id_departamento?: number;
}


export interface ActualizarCantidad {
  id_productos: number;
  operacion:    'agregar' | 'restar';
  cantidad:     number;
}

// ── Buscar productos ─────────────────────────────────────────
export interface BuscarProducto {
  q: string;
}

// ── Stock bajo ───────────────────────────────────────────────
export interface StockBajo {
  limite?: number;
}

// ── Resumen de inventario ────────────────────────────────────
export interface ResumenInventario {
  plantel:         string;
  departamento:    string;
  total_productos: number;
  total_unidades:  number;
}

// ── Respuestas del backend ───────────────────────────────────

export interface RespuestaUpsert {
  accion:   'creado' | 'cantidad_actualizada';
  mensaje:  string;
  producto: Producto;
}

export interface RespuestaGeneral {
  mensaje:  string;
  producto: Producto;
}

export interface RespuestaError {
  mensaje: string;
  detalle?: string;
}