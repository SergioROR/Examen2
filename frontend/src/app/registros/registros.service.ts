import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroResumen, RegistroDetalle, CrearRegistro } from './registros';

@Injectable({ providedIn: 'root' })
export class RegistrosService {

  private baseUrl = 'http://localhost:3005';

  constructor(private _httpClient: HttpClient) {}

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

  // Detalle por día + tipo (ya no usa id_registro sino fecha+tipo)
  VerDetalle(fecha: string, tipo: string, id_plantel: number, id_departamento: number): Observable<RegistroDetalle[]> {
    return this._httpClient.get<RegistroDetalle[]>(
      `${this.baseUrl}/api/registros/detalle`,
      { headers: {
          'x-fecha':         fecha,
          'x-tipo':          tipo,
          'x-plantel':       String(id_plantel),
          'x-departamento':  String(id_departamento)
      }}
    );
  }
}