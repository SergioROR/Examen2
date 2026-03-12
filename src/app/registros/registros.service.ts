import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroResumen, RegistroDetalle, CrearRegistro } from './registros';

@Injectable({
  providedIn: 'root'
})
export class RegistrosService {

  constructor(private _httpClient: HttpClient) { }
  private baseUrl: string = 'http://localhost:3005';  // sin /api al final

  CrearRegistro(data: CrearRegistro): Observable<{ mensaje: string; id_registro: number }> {
    return this._httpClient.post<{ mensaje: string; id_registro: number }>(
      `${this.baseUrl}/api/registros`, data
    );
  }

  VerRegistros(id_plantel: number): Observable<RegistroResumen[]> {
    return this._httpClient.get<RegistroResumen[]>(
      `${this.baseUrl}/api/registros`,
      { headers: { 'x-plantel': String(id_plantel) } }
    );
  }

  VerDetalle(id_registro: number): Observable<RegistroDetalle[]> {
    return this._httpClient.get<RegistroDetalle[]>(
      `${this.baseUrl}/api/registros/detalle`,
      { headers: { 'x-registro': String(id_registro) } }
    );
  }
}