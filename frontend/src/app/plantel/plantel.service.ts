import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plantel,DetallePlantel } from './plantel';

@Injectable({
  providedIn: 'root'
})
export class PlantelService {
  constructor(private _httpClient:HttpClient) { }
  private baseUrl: string = 'http://localhost:3005/api';

  VerPlanteles():Observable<Plantel[]>{
    return this._httpClient.get<Plantel[]>(`${this.baseUrl}/planteles`)
  }

  VerDetalle(id: number): Observable<DetallePlantel> {
    return this._httpClient.get<DetallePlantel>(`${this.baseUrl}/planteles/detalle/${id}`);
  }

  HacerPrincipal(id: number): Observable<{ mensaje: string }> {
    return this._httpClient.patch<{ mensaje: string }>(
      `${this.baseUrl}/planteles/${id}/principal`, {}
    );
  }

  AgregarPlanteles(nombre: string, imagen: File){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('imagen', imagen);  

    return this._httpClient.post<any>(`${this.baseUrl}/plantel`, formData);
  }
}
