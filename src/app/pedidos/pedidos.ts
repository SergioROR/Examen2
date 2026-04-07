// pedidos.interfaces.ts

export interface Pedido {
  id_pedido:        number;
  fecha:            string;
  descripcion:      string;
  estado:           'pendiente' | 'aceptado' | 'en_camino' | 'entregado' | 'rechazado';
  plantel:          string;
  usuario:          string;
  total_productos:    number;
  id_usuario_envio:   number | null;
}

export interface DetallePedido {
  id_detalle_pedido: number;
  cantidad:          number;
  producto:          string;
  modelo:            string;
  num_serie:         string;
  descripcion:       string;
  stock_actual:      number;
}

export interface CrearPedido {
  descripcion?:  string;
  id_plantel:    number;
  id_usuario:    number;
  productos:     { id_productos: number; cantidad: number }[];
}

export interface SolicitudProducto {
  id_solicitud: number;
  nombre:       string;
  descripcion:  string;
  modelo:       string;      // ✅ nuevo
  cantidad:     number;      // ✅ nuevo
  estado:       string;
  usuario:      string;
  plantel:      string;
  id_plantel:   number;      // ✅ nuevo
}

export interface CrearSolicitud {
  nombre:       string;
  descripcion?: string;
  modelo?:      string;  // ✅
  cantidad?:    number;  // ✅
  id_usuario:   number;
  id_plantel:   number;
}