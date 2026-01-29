import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-plantel',
  imports: [RouterLink, FormsModule],
  templateUrl: './plantel.component.html',
  styleUrl: './plantel.component.css'
})
export class PlantelComponent {
  public nombre: string ="";
  public encargado: string="";

  planteles: { nombre: string; encargado: string }[] = [];
  addPlantel() {
  if (this.nombre.trim() && this.encargado.trim()) {
    this.planteles.push({
      nombre: this.nombre,
      encargado: this.encargado
    });

    this.nombre = '';
    this.encargado = '';
  }
}
}
