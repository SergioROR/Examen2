import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plantel } from './plantel';

@Injectable({
  providedIn: 'root'
})
export class PlantelService {
  constructor(private _httpClient:HttpClient) { }
  private baseUrl: string = 'http://localhost:3005/api';

  VerPlanteles():Observable<Plantel[]>{
    return this._httpClient.get<Plantel[]>(`${this.baseUrl}/planteles`)
  }
  AgregarPlanteles(nombre: string, imagen: File){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('imagen', imagen);  

    return this._httpClient.post<any>(`${this.baseUrl}/plantel`, formData);
  }
}
