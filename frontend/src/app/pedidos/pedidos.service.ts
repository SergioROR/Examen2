// pedidos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido, DetallePedido, CrearPedido, SolicitudProducto, CrearSolicitud } from './pedidos';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private base = 'http://localhost:3005';

  constructor(private http: HttpClient) { }

  // ── Pedidos ──────────────────────────────────────────────
  CrearPedido(data: CrearPedido): Observable<{ mensaje: string; id_pedido: number }> {
    return this.http.post<{ mensaje: string; id_pedido: number }>(`${this.base}/api/pedidos`, data);
  }

  VerPendientes(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/api/pedidos/pendientes`);
  }

  VerAceptados(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/api/pedidos/aceptados`);
  }

  VerMisPedidos(id_plantel: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/api/pedidos/mis-pedidos`,
      { headers: { 'x-plantel': String(id_plantel) } });
  }

  VerDetalle(id_pedido: number): Observable<DetallePedido[]> {
    return this.http.get<DetallePedido[]>(`${this.base}/api/pedidos/detalle`,
      { headers: { 'x-pedido': String(id_pedido) } });
  }

  CambiarEstado(id_pedido: number, estado: string, id_usuario_admin: number, id_plantel_admin?: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.base}/api/pedidos/${id_pedido}/estado`,
      { estado, id_usuario_admin, id_plantel_admin }
    );
  }

  ConfirmarEntrega(id_pedido: number, id_usuario: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.base}/api/pedidos/${id_pedido}/entregado`,
      { id_usuario_admin: id_usuario } // 👈 solo el usuario, el plantel lo saca el backend
    );
  }

  // ── Solicitudes ──────────────────────────────────────────
  CrearSolicitud(data: CrearSolicitud): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.base}/api/solicitudes`, data);
  }

  VerSolicitudes(): Observable<SolicitudProducto[]> {
    return this.http.get<SolicitudProducto[]>(`${this.base}/api/solicitudes`);
  }

  ActualizarSolicitud(id: number, estado: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.base}/api/solicitudes/${id}/estado`, { estado });
  }
}