import { Routes } from '@angular/router';
import { UsuarioComponent }        from './components/usuario/usuario.component';
import { PlantelComponent }        from './components/plantel/plantel.component';
import { ProductoComponent }       from './components/producto/producto.component';
import { GeneralComponent }        from './components/general/general.component';
import { CrearPlantelComponent }   from './components/crear-plantel/crear-plantel.component';
import { LoginComponent }          from './components/login/login.component';
import { CrearUsuarioComponent }   from './components/crear-usuario/crear-usuario.component';
import { RegistrosComponent }      from './components/registro/registro.component';
import { AdminPedidosComponent }   from './components/pedidos/pedidos.component';
import { MisPedidosComponent }     from './components/mis-pedidos/mis-pedidos.component';
import { authGuard }               from './guards/auth.guard';
import { adminGuard }              from './guards/admin.guard';
import { loginGuard }              from './guards/login.guard';
import { DepartamentosComponent } from './components/departamentos/departamentos.component';

export const routes: Routes = [

  { path: '', component: LoginComponent, canActivate: [loginGuard] },

  { path: 'general',       component: GeneralComponent,      canActivate: [authGuard] },
  { path: 'planteles',     component: PlantelComponent,      canActivate: [authGuard, adminGuard] },
  { path: 'crearPlantel',  component: CrearPlantelComponent, canActivate: [authGuard, adminGuard] },
  { path: 'usuarios',      component: UsuarioComponent,      canActivate: [authGuard, adminGuard] },
  { path: 'crearUsuarios', component: CrearUsuarioComponent, canActivate: [authGuard, adminGuard] },
  { path: 'pedidos-admin', component: AdminPedidosComponent, canActivate: [authGuard, adminGuard] },

  { path: 'productos',  component: ProductoComponent,  canActivate: [authGuard] },
  { path: 'departamentos',  component: DepartamentosComponent,  canActivate: [authGuard] },
  { path: 'registros',  component: RegistrosComponent, canActivate: [authGuard] },
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];