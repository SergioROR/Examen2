import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const sesion = sessionStorage.getItem('datos_usuario');

  // Si NO hay sesión → deja entrar al login
  if (!sesion) return true;

  // Si SÍ hay sesión → redirige según rol
  const { rol } = JSON.parse(sesion);
  return router.createUrlTree([rol === 'admin' ? '/general' : '/productos']);
};