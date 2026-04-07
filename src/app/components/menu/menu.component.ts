import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../usuario/usuario.service';
import { AvatarService } from '../../avatares/avatares.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  indexActivo: number = 0;
  nombre: string      = '';
  rol: string         = '';
  imagen: string | null = null;
  menuAbierto: boolean  = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private avatarSvc: AvatarService
  ) {}

  ngOnInit(): void {
    const datos = sessionStorage.getItem('datos_usuario');
    if (datos) {
      const usuario  = JSON.parse(datos);
      this.nombre    = usuario.nombre;
      this.rol       = usuario.rol;
      this.imagen    = usuario.imagen ?? null;
    }

    document.addEventListener('click', () => {
      this.menuAbierto = false;
    });
  }

  get avatarUrl(): string {
    if (!this.imagen) return 'http://localhost:3005/imagenes/avatares/default.png';
    return `http://localhost:3005/imagenes/avatares/${this.imagen}`;
  }

  setIndex(i: number): void {
    this.indexActivo = i;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  get esAdmin(): boolean {
    return this.rol === 'Admin';
  }

  get totalItems(): number {
    return this.esAdmin ? 6 : 5;
  }

  logout(event: Event): void {
    event.stopPropagation();
    sessionStorage.removeItem('datos_usuario');
    this.router.navigate(['/login'], { replaceUrl: true });
    this.usuarioService.mostrarMenu = false;
  }
}