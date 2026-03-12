import { Routes } from '@angular/router';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { PlantelComponent } from './components/plantel/plantel.component';
import { ProductoComponent } from './components/producto/producto.component';
import { GeneralComponent } from './components/general/general.component';
import { CrearPlantelComponent } from './components/crear-plantel/crear-plantel.component';
import { LoginComponent } from './components/login/login.component';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { RegistrosComponent } from './components/registro/registro.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'general', component: GeneralComponent},
    {path: 'planteles', component: PlantelComponent},
    {path: 'crearPlantel', component: CrearPlantelComponent},
    {path: 'usuarios', component: UsuarioComponent},
    {path: 'crearUsuarios', component: CrearUsuarioComponent},
    {path: 'registros', component: RegistrosComponent},
    {path: 'productos', component: ProductoComponent}
];
