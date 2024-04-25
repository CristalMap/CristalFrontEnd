import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DataTablesModule } from 'angular-datatables';
import { NgChartsModule } from 'ng2-charts';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { AutenticarComponent } from './components/pages/autenticar/autenticar.component';
import { CriarContaComponent } from './components/pages/criar-conta/criar-conta.component';
import { RecuperarSenhaComponent } from './components/pages/recuperar-senha/recuperar-senha.component';
import { HomeComponent } from './components/pages/home/home.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { MapaComponent } from './components/pages/mapa/mapa.component';
import { MinhasDenunciasComponent } from './components/pages/minhas-denuncias/minhas-denuncias.component';
import { PerfilComponent } from './components/pages/perfil/perfil.component';
import { AdministradorComponent } from './components/pages/administrador/administrador.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AutenticarComponent,
    CriarContaComponent,
    RecuperarSenhaComponent,
    HomeComponent,
    FooterComponent,
    MapaComponent,
    MinhasDenunciasComponent,
    PerfilComponent,
    AdministradorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    LeafletModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DataTablesModule,
    NgChartsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot()
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
