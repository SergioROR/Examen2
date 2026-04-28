import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const sesion = sessionStorage.getItem('datos_usuario');

  // ✅ Si hay sesión → deja pasar
  if (sesion) return true;

  // ❌ Si no hay → manda al login correctamente
  return router.createUrlTree(['/login']);
};