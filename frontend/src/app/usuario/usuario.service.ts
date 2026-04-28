import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioC } from './usuario';
import { RespuestaApi } from './usuario';
import { RespuestaCambioEstado } from './usuario';
import { throwError } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private _httpClient: HttpClient) { }
  private baseUrl: string = 'http://localhost:3005/api';

  login(usuario: string, contra: string): Observable<any> {
    return this._httpClient.post<any>(`${this.baseUrl}/login`, {
      correo: usuario, password: contra
    });

  }

  MostrarUsuarios(): Observable<Usuario[]> {
    return this._httpClient.get<Usuario[]>(`${this.baseUrl}/usuarios`)
  }

  cambiarEstado(correo: string, estado: boolean): Observable<RespuestaCambioEstado> {
    const body = { correo, estado };
    return this._httpClient.put<RespuestaCambioEstado>(
      `${this.baseUrl}/cambiarEstado`,
      body
    );
  }

  editarUsuario(datos: {
    id_usuario: number;
    nombre?: string;
    apellidos?: string;
    correo?: string;
    rol?: string;
    id_plantel?: number;
  }): Observable<{ mensaje: string }> {
    return this._httpClient.put<{ mensaje: string }>(
      `${this.baseUrl}/usuario/editar`, datos
    );
  }

  crearUsuario(usuario: UsuarioC): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}/usuario`, usuario);
  }

  cambiarContraseña(correo: string, password: string): Observable<RespuestaApi> {
    const body = { correo, password };
    return this._httpClient.put<RespuestaApi>(
      `${this.baseUrl}/cambiarContraseña`,
      body
    );
  }
  get mostrarMenu(): boolean {
    return !!sessionStorage.getItem('datos_usuario');
  }

  set mostrarMenu(valor: boolean) {
    if (valor) {
      // No hacemos nada aquí, el token ya lo guarda el login
    } else {
      sessionStorage.removeItem('datos_usuario');
    }
  }
}
