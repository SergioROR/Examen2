import { Component } from '@angular/core';
import { RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  indexActivo: number = 0;
  nombre: string = "";
  rol: string="";
 

  ngOnInit(){
    const datos = localStorage.getItem('datos_usuario');
    if (datos){
      const usuario = JSON.parse(datos);
      this.nombre = usuario.nombre;
      this.rol = usuario.rol;
    }
    
  }

 
 setIndex(i: number) {
    this.indexActivo = i;
    
  }
}
