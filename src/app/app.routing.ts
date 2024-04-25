import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AutenticarComponent } from './components/pages/autenticar/autenticar.component';
import { CriarContaComponent } from './components/pages/criar-conta/criar-conta.component';
import { RecuperarSenhaComponent } from './components/pages/recuperar-senha/recuperar-senha.component';
import { HomeComponent } from "./components/pages/home/home.component";
import { MapaComponent } from "./components/pages/mapa/mapa.component";
import { MinhasDenunciasComponent } from "./components/pages/minhas-denuncias/minhas-denuncias.component";
import { PerfilComponent } from "./components/pages/perfil/perfil.component";
import { AdministradorComponent } from "./components/pages/administrador/administrador.component";

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: HomeComponent },
    { path: 'autenticar', component: AutenticarComponent },
    { path: 'criar-conta', component: CriarContaComponent },
    { path: 'recuperar-senha', component: RecuperarSenhaComponent },
    { path: 'mapa', component: MapaComponent },
    { path: 'minhas-denuncias', component: MinhasDenunciasComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'administrador', component: AdministradorComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}