import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plantel, Departamento, UsuarioSesion } from './departamentos';

@Injectable({ providedIn: 'root' })
export class DepartamentosService {

  // Sin /api al final — se agrega en cada método
  private baseUrl: string = 'http://localhost:3005';

  constructor(private _httpClient: HttpClient) {}

  getUsuarioSesion(): UsuarioSesion | null {
    const raw = localStorage.getItem('datos_usuario');
    if (!raw) return null;
    try { return JSON.parse(raw) as UsuarioSesion; }
    catch { return null; }
  }

  VerPlanteles(): Observable<Plantel[]> {
    return this._httpClient.get<Plantel[]>(`${this.baseUrl}/api/planteles`);
  }

  VerDepartamentosPorPlantel(id_plantel: number): Observable<Departamento[]> {
    return this._httpClient.get<Departamento[]>(`${this.baseUrl}/api/departamentos/${id_plantel}`);
  }
}