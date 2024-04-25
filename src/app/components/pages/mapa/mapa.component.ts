import { Component, AfterViewInit } from '@angular/core';
import { Map, Marker, Popup } from 'mapbox-gl';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DenunciaModel } from 'src/app/interfaces/DenunciaModel';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements AfterViewInit {

  private map!: Map;

  mostrarDescricaoCompleta: boolean = false;
  denunciaSelecionada: any;
  localizacaoPadrao: number[] = [-51.9253, -14.235];
  mensagemErro: string = '';
  token: string = '';
  denunciasAprovadas: DenunciaModel = { message: '', denuncias: [] };

  constructor(private LocalStorageService: LocalStorageService, private httpClient: HttpClient, private toastr: ToastrService,
    private datePipe: DatePipe) {
    if (this.LocalStorageService.verificarUsuarioLogado()) {
      this.token = JSON.parse(LocalStorageService.pegarToken() as string).token
    }
    else {
      LocalStorageService.redirecionarUsuarioDeslogado();
    }
  }

  ngAfterViewInit(): void {
    this.map = new Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [this.localizacaoPadrao[0], this.localizacaoPadrao[1]],
      zoom: 4,
    });

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.get(environment.api + "/api/ListarDenunciasAprovadas", httpOptions).subscribe({
      next: (data: any) => {
        this.denunciasAprovadas = data as DenunciaModel;
        this.denunciasAprovadas.denuncias.forEach(element => {
          const formattedDescription = element.descricao.replace(/\n/g, '<br>');

          const popupContent = `
            <img src="${element.fotoBase64}" width="100%" height="50%">
            <h5 class="mt-2" >${element.titulo}</h5>
            <div style=" max-height: 100px; overflow-y: auto;">
              <span style="word-wrap: break-word;">${formattedDescription}</span>
            </div>
            <p class="mb-2 mt-2">Criado em: ${this.datePipe.transform(element.dataHoraCriacao, 'dd/MM/yyyy')}</p>
            <img src="../../../../assets/images/icons-dog.png" width="40px" height="40px">
            <span>${element.quantidadeMamiferos}</span>
            <img src="../../../../assets/images/icons-parrot.png" width="40px" height="40px">
            <span>${element.quantidadeAves}</span>
            <img src="../../../../assets/images/icone-cobra.png" width="40px" height="40px">
            <span>${element.quantidadeRepteis}</span>
            <img src="../../../../assets/images/icons-peixe.png" width="40px" height="40px">
            <span>${element.quantidadePeixes}</span>
            `;

          const popup = new Popup().setHTML(popupContent);
          new Marker({ color: 'red' }).setLngLat([element.endereco.longitude, element.endereco.latitude]).setPopup(popup).addTo(this.map);
        });

      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  };

  irParaDenuncia(longitude: number, latitude: number) {
    if (this.map) {
      this.map.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        speed: 1.2,
      });
    } else {
      this.toastr.error('Mapa não inicializado.', 'Notificação', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
    }
  }

  minhaLocalizacao() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.map.flyTo({
          center: [longitude, latitude],
          zoom: 10,
        });
      }, (error) => {
        this.toastr.error('Erro ao obter a localização.', 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      });
    } else {
      this.toastr.error('Geolocalização não suportada pelo navegador.', 'Notificação', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
    }
  }
};