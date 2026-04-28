import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaAdmin, RespuestaUsuario } from './general';

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private base = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  GetDatosAdmin(): Observable<RespuestaAdmin> {
    return this.http.get<RespuestaAdmin>(`${this.base}/api/general/admin`);
  }

  GetDatosUsuario(id_plantel: number): Observable<RespuestaUsuario> {
    return this.http.get<RespuestaUsuario>(
      `${this.base}/api/general/usuario`,
      { headers: { 'x-plantel': String(id_plantel) } }
    );
  }
}