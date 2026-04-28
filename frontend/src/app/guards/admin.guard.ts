import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const raw = sessionStorage.getItem('datos_usuario');

  if (!raw) return router.createUrlTree(['/login']);

  const sesion = JSON.parse(raw);

  // Si es admin, puede pasar a cualquier ruta que tenga este Guard
  if (sesion.rol === 'Admin') {
    return true;
  }

  // Si NO es admin y trata de entrar a rutas de admin, lo mandamos a productos
  return router.createUrlTree(['/productos']);
};