import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { CommonModule } from '@angular/common';
import { UsuarioService } from './usuario/usuario.service';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet,MenuComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public usuarioService: UsuarioService) {}
}
