import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from './productos';
import { ProductoUpsert } from './productos';
import { ActualizarCantidad } from './productos';
import { RespuestaUpsert } from './productos';
import { RespuestaGeneral } from './productos';
import { ProductoEditar } from './productos';
import { ResumenInventario } from './productos';
import { SolicitudAtendida } from './productos';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private _httpClient: HttpClient) { }
  private baseUrl: string = 'http://localhost:3005/api';

  VerProductos(): Observable<Producto[]> {
    return this._httpClient.get<Producto[]>(`${this.baseUrl}/productos`);
  }

  // 2. Obtener un producto por id
  VerDetalle(id_productos: number): Observable<Producto> {
    return this._httpClient.post<Producto>(`${this.baseUrl}/productos/detalle`, { id_productos });
  }

  // 3. Crear producto o sumar cantidad si ya existe (UPSERT)
  CrearProducto(datos: ProductoUpsert): Observable<RespuestaUpsert> {
    return this._httpClient.post<RespuestaUpsert>(`${this.baseUrl}/productos`, datos);
  }

  // 4. Agregar o restar unidades
  ActualizarCantidad(datos: ActualizarCantidad): Observable<RespuestaGeneral> {
    return this._httpClient.put<RespuestaGeneral>(`${this.baseUrl}/productos/cantidad`, datos);
  }

  // 5. Editar campos del producto
  EditarProducto(datos: ProductoEditar): Observable<RespuestaGeneral> {
    return this._httpClient.put<RespuestaGeneral>(`${this.baseUrl}/productos/editar`, datos);
  }

  // 6. Eliminar producto
  EliminarProducto(id_productos: number): Observable<RespuestaGeneral> {
    return this._httpClient.delete<RespuestaGeneral>(`${this.baseUrl}/productos/eliminar`, {
      body: { id_productos }
    });
  }

  // 7. Buscar por nombre, modelo o num_serie
  BuscarProducto(q: string): Observable<Producto[]> {
    return this._httpClient.post<Producto[]>(`${this.baseUrl}/productos/buscar`, { q });
  }

  // 8. Productos con stock bajo
  StockBajo(limite?: number): Observable<Producto[]> {
    return this._httpClient.post<Producto[]>(`${this.baseUrl}/productos/stock-bajo`, { limite });
  }

  // 9. Resumen de inventario por plantel y departamento
  ResumenInventario(): Observable<ResumenInventario[]> {
    return this._httpClient.get<ResumenInventario[]>(`${this.baseUrl}/productos/resumen`);
  }

  VerProductosPrincipal(): Observable<Producto[]> {
    return this._httpClient.get<Producto[]>(`${this.baseUrl}/productos/principal`);
  }

  VerSolicitudesAtendidas(): Observable<SolicitudAtendida[]> {
    return this._httpClient.get<SolicitudAtendida[]>(`${this.baseUrl}/solicitudes/atendidas`);
  }

  MarcarSolicitudUsada(
    id_solicitud: number,
    id_producto_creado: number,
    id_plantel_destino: number,
    id_productos: number,
    cantidad: number
  ): Observable<any> {
    return this._httpClient.patch(
      `${this.baseUrl}/solicitudes/${id_solicitud}/usar`,
      { id_producto_creado, id_plantel_destino, id_productos, cantidad }
    );
  }
}
