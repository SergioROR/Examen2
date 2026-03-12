import { Component, OnInit } from '@angular/core';
import { PlantelService } from '../../plantel/plantel.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-plantel',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './plantel.component.html',
  styleUrl: './plantel.component.css'
})
export class PlantelComponent implements OnInit {
  listaPlanteles: any[] = [];
  listaPlantelesFiltrada: any[] = [];  // ← esta es la que usaremos en el HTML
  terminoBusqueda: string = '';
  readonly URL_API = 'http://localhost:3005/imagenes/';

  constructor(
    private ServicioPlanteles: PlantelService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.ServicioPlanteles.VerPlanteles().subscribe({
      next: (planteles) => {
        this.listaPlanteles = planteles;
        this.listaPlantelesFiltrada = [...planteles];  // ← inicializa la lista filtrada con TODOS los planteles
      },
      error: (err) => {
        console.error('Error al cargar planteles', err);
      }
    });
  }

  // Renombré el método para que sea más claro (antes era filtrarUsuarios)
  filtrarPlanteles() {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    // Si no hay término de búsqueda, muestra todos
    if (!termino) {
      this.listaPlantelesFiltrada = [...this.listaPlanteles];
      return;
    }

    // Filtra por nombre del plantel
    this.listaPlantelesFiltrada = this.listaPlanteles.filter(plantel =>
      plantel.nombre?.toLowerCase().includes(termino)
    );
  }
}