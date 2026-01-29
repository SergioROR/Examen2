import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-producto',
  imports: [RouterLink,FormsModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent {
  public nombre: string="";
  public descripcion: string="";
  public modelo: string="";
  public cantidad: number=0;
  public num_serie: string="";


}
