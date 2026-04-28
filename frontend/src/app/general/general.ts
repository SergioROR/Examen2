export interface StatsAdmin {
  entradas:               number;
  salidas:                number;
  stockTotal:             number;
  stockBajo:              number;
  pedidosPendientes:      number;
  solicitudesPendientes:  number;
}

export interface StatsUsuario {
  misPedidos:             number;
  pedidosEntregados:      number;
  pedidosPendientes:      number;
  solicitudesPendientes:  number;
  productosDisponibles:   number;
}

export interface PedidoPorPlantel {
  plantel: string;
  total:   number;
}

export interface PedidoResumen {
  id_pedido:        number;
  fecha:            string;
  descripcion:      string;
  estado:           string;
  plantel:          string;
  usuario:          string;
  usuario_imagen?:  string;
  total_productos:  number;
}

export interface ProductoSolicitado {
  producto: string;
  total:    number;
}

export interface RespuestaAdmin {
  entradas:                number;
  salidas:                 number;
  stockTotal:              number;
  stockBajo:               number;
  pedidosPendientes:       number;
  solicitudesPendientes:   number;
  pedidosPorPlantel:       PedidoPorPlantel[];
  productosMasSolicitados: ProductoSolicitado[]; // ✅ nuevo
  pedidosRecientes:        PedidoResumen[];
}

export interface RespuestaUsuario extends StatsUsuario {
  pedidosRecientes: PedidoResumen[];
}