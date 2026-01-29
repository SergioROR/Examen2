import { Routes } from '@angular/router';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { MenuComponent } from './components/menu/menu.component';
import { PlantelComponent } from './components/plantel/plantel.component';
import { ProductoComponent } from './components/producto/producto.component';

export const routes: Routes = [
    {path: '', component: UsuarioComponent},
    {path: 'menu', component: MenuComponent},
    {path: 'planteles', component: PlantelComponent},
    {path: 'productos', component: ProductoComponent}
];
