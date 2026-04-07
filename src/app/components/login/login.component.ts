import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { UsuarioService } from '../../usuario/usuario.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
   standalone: true,
  imports: [
    FormsModule, 
    MatSnackBarModule 
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  public usuario: string = "";
  public contra: string = "";

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private snackBar: MatSnackBar
  ){}

  login() {
    if (!this.usuario.trim() || !this.contra.trim()) {
      this.snackBar.open('Por favor, ingresa tus credenciales', 'Cerrar', { duration: 3000,verticalPosition: 'top' });
      return;
    }

    this.usuarioService.login(this.usuario, this.contra).subscribe({
      next: (resp) => {
        if (resp.verificacion) {
          sessionStorage.setItem('datos_usuario', JSON.stringify(resp.usuario));
          this.usuarioService.mostrarMenu = true; 
          this.router.navigate(['/general']);
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error de conexión con el servidor';
        
        this.snackBar.open(mensajeError, 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }
}
