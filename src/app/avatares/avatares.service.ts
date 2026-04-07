// avatar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  private base = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  ListarAvatares(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/api/avatares`);
  }

  ActualizarImagen(id_usuario: number, imagen: string): Observable<{ mensaje: string; imagen: string }> {
    return this.http.put<{ mensaje: string; imagen: string }>(
      `${this.base}/api/usuario/imagen`, { id_usuario, imagen }
    );
  }

  GetUrlAvatar(imagen: string | null): string {
    if (!imagen) return `${this.base}/imagenes/avatares/default.png`;
    return `${this.base}/imagenes/avatares/${imagen}`;
  }
}